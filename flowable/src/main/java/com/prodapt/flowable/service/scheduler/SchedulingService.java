package com.prodapt.flowable.service.scheduler;

import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
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
     * Used only for getAvailableSlots() to show predefined time slots.
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
     * Checks if a shift covers a given time window, handling overnight shifts correctly.
     *
     * @param shift The employee's shift
     * @param windowStart Start of the time window
     * @param windowEnd End of the time window
     * @return true if the shift covers the entire window
     */
    private boolean doesShiftCoverWindow(Shift shift, ZonedDateTime windowStart, ZonedDateTime windowEnd) {
        if (shift == null) {
            return false;
        }

        // Calculate shift boundaries on the window's start day
        ZonedDateTime windowDay = windowStart.truncatedTo(ChronoUnit.DAYS);
        ZonedDateTime shiftStartOnWindowDay = windowDay.with(shift.getStartTime());
        ZonedDateTime shiftEndOnWindowDay;

        boolean isOvernightShift = shift.getEndTime().isBefore(shift.getStartTime());
        
        if (isOvernightShift) {
            // Overnight shift: end time is next day
            shiftEndOnWindowDay = shiftStartOnWindowDay.plusDays(1).with(shift.getEndTime());
        } else {
            shiftEndOnWindowDay = shiftStartOnWindowDay.with(shift.getEndTime());
        }

        // Check if window is fully contained within shift starting on window's day
        boolean coveredByCurrentDay = !windowStart.isBefore(shiftStartOnWindowDay) && 
                                      !windowEnd.isAfter(shiftEndOnWindowDay);

        if (coveredByCurrentDay) {
            return true;
        }

        // For overnight shifts, also check if window is covered by shift starting previous day
        if (isOvernightShift) {
            ZonedDateTime prevDayShiftStart = shiftStartOnWindowDay.minusDays(1);
            ZonedDateTime prevDayShiftEnd = shiftEndOnWindowDay.minusDays(1);
            return !windowStart.isBefore(prevDayShiftStart) && 
                   !windowEnd.isAfter(prevDayShiftEnd);
        }

        return false;
    }

    /**
     * Finds available 4-hour slots within the given start and end range for the required skill.
     * Returns only predefined slots (0, 4, 8, 12, 16, 20) that are in the FUTURE.
     * A slot is available if at least one active employee has capacity during their shift,
     * is not on leave, and has not exceeded maxDevicesPerSlot.
     *
     * @param start The start of the time range.
     * @param end The end of the time range.
     * @param skill The required skill.
     * @return List of ZonedDateTime representing the start times of available slots.
     */
    public List<ZonedDateTime> getAvailableSlots(ZonedDateTime start, ZonedDateTime end, String skill) {
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        
        // Fetch employees with the skill, active status, and tasks/leaves within the time range
        List<Employee> candidates = employeeRepository.findBySkillAndActiveWithLeavesAndTasksInRange(skill, start, end);

        List<ZonedDateTime> allSlots = getSlots(start, end);
        List<ZonedDateTime> availableSlots = new ArrayList<>();

        for (ZonedDateTime slotStart : allSlots) {
            // STRICT: Only include future slots
            if (!slotStart.isAfter(now)) {
                continue;
            }

            ZonedDateTime slotEnd = slotStart.plusHours(4);

            for (Employee emp : candidates) {
                // Check shift coverage
                if (!doesShiftCoverWindow(emp.getShift(), slotStart, slotEnd)) {
                    continue;
                }

                // Check leaves
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
                    if (!task.getEndTime().isBefore(slotStart) && !task.getStartTime().isAfter(slotEnd)) {
                        currentCount += task.getWorkflowCount() != null ? task.getWorkflowCount() : 0;
                    }
                }

                int availableCapacity = maxDevicesPerSlot - currentCount;
                if (availableCapacity > 0) {
                    if (!availableSlots.contains(slotStart)) {
                        availableSlots.add(slotStart);
                    }
                    break;
                }
            }
        }

        Collections.sort(availableSlots);
        return availableSlots;
    }

    /**
     * Assigns the given WorkflowExecution to an employee for a 4-hour window starting at the requested time.
     * Lead engineer can schedule at ANY FUTURE time (not restricted to fixed slots).
     * Creates a 4-hour window from the exact requested time (e.g., 17:45 → 17:45-21:45).
     * 
     * Selects the least occupied employee (by total devices for the day) who:
     * - Has the required skill
     * - Shift covers the 4-hour window
     * - Not on leave during the window
     * - Has capacity (tasks in that window have combined workflow count < maxDevicesPerSlot)
     * 
     * Task reuse logic:
     * - If employee has a task with EXACT same start/end time, add workflow to it
     * - Otherwise, create a new task (even if there are overlapping tasks)
     *
     * @param workflowExec The WorkflowExecution to assign (may already be assigned to a previous task).
     * @param requestedTime The exact start time for the 4-hour window (must be present or future).
     * @param skill The required skill for the assignment.
     * @throws RuntimeException if requested time is in the past or no available employee is found.
     */
    @Transactional
    public void assignWorkflowToEmployee(WorkflowExecution workflowExec, ZonedDateTime requestedTime, String skill) {
        
        // Validate: No scheduling in the past
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        if (requestedTime.isBefore(now)) {
            throw new RuntimeException(String.format(
                "Cannot schedule in the past. Requested time: %s, Current time: %s",
                requestedTime, now
            ));
        }

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

        // Create 4-hour window from exact requested time
        ZonedDateTime windowStart = requestedTime.withZoneSameInstant(ZoneOffset.UTC);
        ZonedDateTime windowEnd = windowStart.plusHours(4);
        
        // Get the full day range for querying employee tasks
        ZonedDateTime dayStart = windowStart.truncatedTo(ChronoUnit.DAYS);
        ZonedDateTime dayEnd = dayStart.plusDays(1);

        // Fetch candidates with tasks and leaves in the day range
        List<Employee> candidates = employeeRepository.findBySkillAndActiveWithLeavesAndTasksInRange(skill, dayStart, dayEnd);

        Employee selectedEmp = null;
        int minTotalDayCount = Integer.MAX_VALUE;
        List<String> rejectionReasons = new ArrayList<>();

        for (Employee emp : candidates) {
            String empId = emp.getAttUid();
            
            // Check shift coverage
            if (!doesShiftCoverWindow(emp.getShift(), windowStart, windowEnd)) {
                rejectionReasons.add(String.format("%s: Shift %s doesn't cover window %s-%s", 
                    empId, 
                    emp.getShift() != null ? emp.getShift().getCode() : "NULL",
                    windowStart.toLocalTime(), 
                    windowEnd.toLocalTime()));
                continue;
            }

            // Check if on leave during window
            boolean onLeave = false;
            for (Leave leave : emp.getLeaves()) {
                if (!leave.getEndTime().isBefore(windowStart) && !leave.getStartTime().isAfter(windowEnd)) {
                    onLeave = true;
                    break;
                }
            }
            if (onLeave) {
                rejectionReasons.add(empId + ": On leave during window");
                continue;
            }

            // Check capacity: count workflows in ALL tasks that overlap with this window
            int currentWindowCount = 0;
            for (Task task : emp.getTasks()) {
                // Check if task overlaps with the requested window
                if (!task.getEndTime().isBefore(windowStart) && !task.getStartTime().isAfter(windowEnd)) {
                    currentWindowCount += task.getWorkflowCount() != null ? task.getWorkflowCount() : 0;
                }
            }
            
            if (currentWindowCount >= maxDevicesPerSlot) {
                rejectionReasons.add(String.format("%s: At capacity (%d/%d workflows in window)", 
                    empId, currentWindowCount, maxDevicesPerSlot));
                continue;
            }

            // Calculate total devices for the day (for load balancing)
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
            String errorMsg = String.format(
                "No available employee found for window %s to %s with skill '%s'. " +
                "Checked %d employees. Reasons: %s",
                windowStart, windowEnd, skill, candidates.size(),
                rejectionReasons.isEmpty() ? "No candidates found with skill" : String.join("; ", rejectionReasons)
            );
            throw new RuntimeException(errorMsg);
        }

        // Find existing task with EXACT same start/end time
        Task existingTask = null;
        for (Task task : selectedEmp.getTasks()) {
            if (task.getStartTime().equals(windowStart) && task.getEndTime().equals(windowEnd)) {
                existingTask = task;
                break;
            }
        }

        Task assignedTask;
        if (existingTask != null) {
            // Add workflow to existing task with exact same time window
            assignedTask = existingTask;
            assignedTask.getWorkflows().add(workflowExec);
            assignedTask.setWorkflowCount(assignedTask.getWorkflowCount() + 1);
        } else {
            // Create new task for this specific time window
            assignedTask = new Task();
            assignedTask.setId(UUID.randomUUID().toString());
            assignedTask.setStartTime(windowStart);
            assignedTask.setEndTime(windowEnd);
            assignedTask.setAssignedEmployee(selectedEmp);
            assignedTask.setWorkflows(new ArrayList<>());
            assignedTask.getWorkflows().add(workflowExec);
            assignedTask.setWorkflowCount(1);
            selectedEmp.getTasks().add(assignedTask);
        }

        workflowExec.setTask(assignedTask);
        workflowExecutionRepository.save(workflowExec);
        taskRepository.save(assignedTask);
        employeeRepository.save(selectedEmp);
    }
}
