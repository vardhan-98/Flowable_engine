package com.prodapt.flowable.service.scheduler;

import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prodapt.flowable.entity.Employee;
import com.prodapt.flowable.entity.Leave;
import com.prodapt.flowable.entity.Shift;
import com.prodapt.flowable.entity.Task;
import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.repository.EmployeeRepository;
import com.prodapt.flowable.repository.TaskRepository;
import com.prodapt.flowable.repository.WorkflowExecutionRepository;

@Service
public class SchedulingService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private WorkflowExecutionRepository workflowExecutionRepository;

    @Value("${app.max.devices.per.slot:5}")
    private int maxDevicesPerSlot;

    /**
     * Generates a list of 4-hour slot start times within the given start and end range in UTC.
     * Slots are aligned to hours 0, 4, 8, 12, 16, 20.
     *
     * @param start The start of the time range (inclusive).
     * @param end The end of the time range (exclusive).
     * @return List of ZonedDateTime representing the start of each 4-hour slot.
     */
    private List<ZonedDateTime> getSlots(ZonedDateTime start, ZonedDateTime end) {
        List<ZonedDateTime> slots = new ArrayList<>();
        ZonedDateTime currentDay = start.withZoneSameInstant(ZoneOffset.UTC).truncatedTo(ChronoUnit.DAYS);
        while (!currentDay.isAfter(end)) {
            for (int hour = 0; hour < 24; hour += 4) {
                ZonedDateTime slotStart = currentDay.withHour(hour).withMinute(0).withSecond(0).withNano(0);
                if (!slotStart.isBefore(start) && slotStart.isBefore(end)) {
                    slots.add(slotStart);
                }
            }
            currentDay = currentDay.plusDays(1);
        }
        return slots;
    }

    /**
     * Finds available 4-hour slots within the given start and end range for the required skill.
     * Queries employees with the skill, their tasks, and leaves within the time range.
     * A slot is available if at least one active employee has capacity during their shift,
     * is not on leave, and has not exceeded maxDevicesPerSlot.
     *
     * @param start The start of the time range.
     * @param end The end of the time range.
     * @param skill The required skill.
     * @return List of ZonedDateTime representing the start times of available slots.
     */
    public List<ZonedDateTime> getAvailableSlots(ZonedDateTime start, ZonedDateTime end, String skill) {
        // Fetch employees with the skill, active status, and tasks/leaves within the time range
        List<Employee> candidates = employeeRepository.findBySkillAndActiveWithLeavesAndTasksInRange(skill, start, end);

        List<ZonedDateTime> allSlots = getSlots(start, end);
        Set<ZonedDateTime> availableSlots = new HashSet<>(); // Use set to avoid duplicates

        for (ZonedDateTime slotStart : allSlots) {
            ZonedDateTime slotEnd = slotStart.plusHours(4);

            for (Employee emp : candidates) {
                // Check shift coverage
                Shift shift = emp.getShift();
                if (shift == null) {
                    continue;
                }
                // Apply shift times to the slot's date
                ZonedDateTime empShiftStart = slotStart.with(shift.getStartTime());
                ZonedDateTime empShiftEnd = slotStart.with(shift.getEndTime());
                // Assuming no overnight shifts; adjust if needed
                boolean shiftCovers = !slotStart.isBefore(empShiftStart) && !slotEnd.isAfter(empShiftEnd);
                if (!shiftCovers) {
                    continue;
                }

                // Check leaves (already filtered by query, but verify for slot-specific overlap)
                boolean onLeave = false;
                for (Leave leave : emp.getLeaves()) {
                    if (!leave.getEndTime().isBefore(slotStart) && !leave.getStartTime().isAfter(slotEnd)) {
                        onLeave = true;
                        break;
                    }
                }
                if (onLeave) {
                    continue;
                }

                // Check existing tasks for overlap and capacity
                int currentCount = 0;
                for (Task task : emp.getTasks()) {
                    // Tasks are already filtered by time range in the query
                    if (!task.getEndTime().isBefore(slotStart) && !task.getStartTime().isAfter(slotEnd)) {
                        currentCount += task.getWorkflowCount() != null ? task.getWorkflowCount() : 0;
                    }
                }

                int availableCapacity = maxDevicesPerSlot - currentCount;
                if (availableCapacity > 0) {
                    availableSlots.add(slotStart);
                    break; // Slot is available if at least one employee has capacity
                }
            }
        }

        return new ArrayList<>(availableSlots);
    }

    /**
     * Assigns the given WorkflowExecution to an employee for the specified slot.
     * Selects the least occupied employee (by total devices for the day) who has capacity in the slot.
     * If the employee has an existing task in the slot, adds the workflow to it; otherwise, creates a new task.
     * Also detaches the workflow from any previous task assignment.
     *
     * @param workflowExec The WorkflowExecution to assign (may already be assigned to a previous task).
     * @param slotStart The start time of the selected slot in UTC.
     * @param skill The required skill for the assignment.
     * @throws RuntimeException if no available employee is found.
     */
    @Transactional
    public void assignWorkflowToEmployee(WorkflowExecution workflowExec, ZonedDateTime slotStart, String skill) {

        // Detach from existing task if assigned
        Task previousTask = workflowExec.getTask();
        if (previousTask != null) {
            previousTask.getWorkflows().remove(workflowExec);
            if (previousTask.getWorkflowCount() != null && previousTask.getWorkflowCount() > 0) {
                previousTask.setWorkflowCount(previousTask.getWorkflowCount() - 1);
            }
            workflowExec.setTask(null);
            taskRepository.save(previousTask);
        }
        ZonedDateTime slotEnd = slotStart.plusHours(4);
        ZonedDateTime dayStart = slotStart.truncatedTo(ChronoUnit.DAYS);
        ZonedDateTime dayEnd = dayStart.plusDays(1);

        // Fetch candidates with tasks and leaves in the day range
        List<Employee> candidates = employeeRepository.findBySkillAndActiveWithLeavesAndTasksInRange(skill, dayStart, dayEnd);

        Employee selectedEmp = null;
        int minTotalDayCount = Integer.MAX_VALUE;

        for (Employee emp : candidates) {
            Shift shift = emp.getShift();
            if (shift == null) {
                continue;
            }
            ZonedDateTime empShiftStart = slotStart.with(shift.getStartTime());
            ZonedDateTime empShiftEnd = slotStart.with(shift.getEndTime());
            boolean shiftCovers = !slotStart.isBefore(empShiftStart) && !slotEnd.isAfter(empShiftEnd);
            if (!shiftCovers) {
                continue;
            }

            boolean onLeave = false;
            for (Leave leave : emp.getLeaves()) {
                if (!leave.getEndTime().isBefore(slotStart) && !leave.getStartTime().isAfter(slotEnd)) {
                    onLeave = true;
                    break;
                }
            }
            if (onLeave) {
                continue;
            }

            int currentSlotCount = 0;
            for (Task task : emp.getTasks()) {
                if (!task.getEndTime().isBefore(slotStart) && !task.getStartTime().isAfter(slotEnd)) {
                    currentSlotCount += task.getWorkflowCount() != null ? task.getWorkflowCount() : 0;
                }
            }
            if (currentSlotCount >= maxDevicesPerSlot) {
                continue;
            }

            // Calculate total devices for the day
            int totalDayCount = 0;
            for (Task task : emp.getTasks()) {
                totalDayCount += task.getWorkflowCount() != null ? task.getWorkflowCount() : 0;
            }

            // Select the employee with the least total day count
            if (totalDayCount < minTotalDayCount) {
                minTotalDayCount = totalDayCount;
                selectedEmp = emp;
            }
        }

        if (selectedEmp == null) {
            throw new RuntimeException("No available employee found for the slot and skill.");
        }

        // Find existing task in the slot
        Task existingTask = null;
        for (Task task : selectedEmp.getTasks()) {
            if (!task.getEndTime().isBefore(slotStart) && !task.getStartTime().isAfter(slotEnd)) {
                existingTask = task;
                break;
            }
        }

        Task assignedTask;
        if (existingTask != null) {
            assignedTask = existingTask;
            assignedTask.getWorkflows().add(workflowExec);
            assignedTask.setWorkflowCount(assignedTask.getWorkflowCount() + 1);
        } else {
            assignedTask = new Task();
            assignedTask.setId(UUID.randomUUID().toString());
            assignedTask.setStartTime(slotStart);
            assignedTask.setEndTime(slotEnd);
            assignedTask.setAssignedEmployee(selectedEmp);
            assignedTask.setWorkflows(new ArrayList<>());
            assignedTask.getWorkflows().add(workflowExec);
            assignedTask.setWorkflowCount(1);
            selectedEmp.getTasks().add(assignedTask);
        }

        workflowExec.setTask(assignedTask);

        // Save entities
        workflowExecutionRepository.save(workflowExec);
        taskRepository.save(assignedTask);
        // No need to save employee as changes cascade via tasks, but to be safe:
        employeeRepository.save(selectedEmp);
    }
}
