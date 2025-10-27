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
        long threadId = Thread.currentThread().getId();
        String threadName = Thread.currentThread().getName();
        
        System.out.println("\n[THREAD-" + threadId + "][" + threadName + "] getAvailableSlots - Skill: " + skill);
        
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        List<Employee> candidates = employeeRepository.findBySkillAndActiveWithLeavesAndTasksInRange(skill, start, end);
        System.out.println("[THREAD-" + threadId + "] Candidates: " + candidates.size() + ", Checking " + getSlots(start, end).size() + " time slots");

        List<ZonedDateTime> allSlots = getSlots(start, end);
        List<ZonedDateTime> availableSlots = new ArrayList<>();

        for (ZonedDateTime slotStart : allSlots) {
            if (!slotStart.isAfter(now)) {
                continue;
            }

            ZonedDateTime slotEnd = slotStart.plusHours(4);

            for (Employee emp : candidates) {
                if (!doesShiftCoverWindow(emp.getShift(), slotStart, slotEnd)) {
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
        System.out.println("[THREAD-" + threadId + "] Available slots: " + availableSlots.size() + "\n");
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
        long threadId = Thread.currentThread().getId();
        String threadName = Thread.currentThread().getName();
        
        System.out.println("\n[THREAD-" + threadId + "][" + threadName + "] assignWorkflow - Flow: " + workflowExec.getFlowInstanceId() + ", Time: " + requestedTime);
        
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
            System.out.println("[THREAD-" + threadId + "] Detaching from previous task: " + previousTask.getId() + " (was " + previousTask.getWorkflowCount() + " workflows)");
            previousTask.getWorkflows().remove(workflowExec);
            if (previousTask.getWorkflowCount() != null && previousTask.getWorkflowCount() > 0) {
                previousTask.setWorkflowCount(previousTask.getWorkflowCount() - 1);
            }
            workflowExec.setTask(null);
            taskRepository.save(previousTask);
        }

        ZonedDateTime windowStart = requestedTime.withZoneSameInstant(ZoneOffset.UTC);
        ZonedDateTime windowEnd = windowStart.plusHours(4);
        ZonedDateTime dayStart = windowStart.truncatedTo(ChronoUnit.DAYS);
        ZonedDateTime dayEnd = dayStart.plusDays(1);

        List<Employee> candidates = employeeRepository.findBySkillAndActiveWithLeavesAndTasksInRange(skill, dayStart, dayEnd);
        System.out.println("[THREAD-" + threadId + "] Evaluating " + candidates.size() + " candidates for window " + windowStart.toLocalTime() + "-" + windowEnd.toLocalTime());

        Employee selectedEmp = null;
        int minTotalDayCount = Integer.MAX_VALUE;
        List<String> rejectionReasons = new ArrayList<>();
        List<String> eligibleCandidates = new ArrayList<>();

        for (Employee emp : candidates) {
            String empId = emp.getAttUid();
            
            if (!doesShiftCoverWindow(emp.getShift(), windowStart, windowEnd)) {
                rejectionReasons.add(empId + ": Shift doesn't cover window");
                continue;
            }

            boolean onLeave = false;
            for (Leave leave : emp.getLeaves()) {
                if (!leave.getEndTime().isBefore(windowStart) && !leave.getStartTime().isAfter(windowEnd)) {
                    onLeave = true;
                    break;
                }
            }
            if (onLeave) {
                rejectionReasons.add(empId + ": On leave");
                continue;
            }

            int currentWindowCount = 0;
            for (Task task : emp.getTasks()) {
                if (!task.getEndTime().isBefore(windowStart) && !task.getStartTime().isAfter(windowEnd)) {
                    currentWindowCount += task.getWorkflowCount() != null ? task.getWorkflowCount() : 0;
                }
            }
            
            if (currentWindowCount >= maxDevicesPerSlot) {
                rejectionReasons.add(empId + ": At capacity (" + currentWindowCount + "/" + maxDevicesPerSlot + ")");
                continue;
            }

            int totalDayCount = 0;
            StringBuilder taskWindows = new StringBuilder();
            for (Task task : emp.getTasks()) {
                totalDayCount += task.getWorkflowCount() != null ? task.getWorkflowCount() : 0;
                if (taskWindows.length() > 0) {
                    taskWindows.append(", ");
                }
                taskWindows.append(task.getStartTime().toLocalTime()).append("-").append(task.getEndTime().toLocalTime())
                           .append("(").append(task.getWorkflowCount()).append(")");
            }
            
            // This employee is eligible - add to eligible list with task details
            String candidateInfo = empId + " (window: " + currentWindowCount + "/" + maxDevicesPerSlot + 
                                  ", day: " + totalDayCount + ", tasks: " + emp.getTasks().size();
            if (emp.getTasks().size() > 0) {
                candidateInfo += " [" + taskWindows.toString() + "]";
            }
            candidateInfo += ")";
            eligibleCandidates.add(candidateInfo);
            
            if (totalDayCount < minTotalDayCount) {
                minTotalDayCount = totalDayCount;
                selectedEmp = emp;
            }
        }

        // Log all eligible candidates for this thread
        if (!eligibleCandidates.isEmpty()) {
            System.out.println("[THREAD-" + threadId + "] ELIGIBLE candidates (" + eligibleCandidates.size() + "): " + String.join(", ", eligibleCandidates));
        }

        if (selectedEmp == null) {
            System.out.println("[THREAD-" + threadId + "] ERROR: No employee available. Reasons: " + String.join("; ", rejectionReasons));
            throw new RuntimeException(String.format(
                "No available employee found for window %s to %s with skill '%s'. Checked %d employees",
                windowStart, windowEnd, skill, candidates.size()
            ));
        }
        
        System.out.println("[THREAD-" + threadId + "] Selected: " + selectedEmp.getAttUid() + " (day workload: " + minTotalDayCount + " workflows)");

        // Find existing task with EXACT same start/end time
        Task existingTask = null;
        for (Task task : selectedEmp.getTasks()) {
            if (task.getStartTime().equals(windowStart) && task.getEndTime().equals(windowEnd)) {
                existingTask = task;
                System.out.println("[THREAD-" + threadId + "] REUSING task " + task.getId() + " (current: " + task.getWorkflowCount() + " workflows)");
                break;
            }
        }

        Task assignedTask;
        if (existingTask != null) {
            assignedTask = existingTask;
            assignedTask.getWorkflows().add(workflowExec);
            assignedTask.setWorkflowCount(assignedTask.getWorkflowCount() + 1);
            System.out.println("[THREAD-" + threadId + "] Task now has " + assignedTask.getWorkflowCount() + " workflows (GROUPED)");
        } else {
            assignedTask = new Task();
            String newTaskId = UUID.randomUUID().toString();
            assignedTask.setId(newTaskId);
            assignedTask.setStartTime(windowStart);
            assignedTask.setEndTime(windowEnd);
            assignedTask.setAssignedEmployee(selectedEmp);
            assignedTask.setWorkflows(new ArrayList<>());
            assignedTask.getWorkflows().add(workflowExec);
            assignedTask.setWorkflowCount(1);
            selectedEmp.getTasks().add(assignedTask);
            System.out.println("[THREAD-" + threadId + "] NEW task created: " + newTaskId + " (" + windowStart.toLocalTime() + "-" + windowEnd.toLocalTime() + ")");
        }

        workflowExec.setTask(assignedTask);
        workflowExecutionRepository.save(workflowExec);
        taskRepository.save(assignedTask);
        employeeRepository.save(selectedEmp);
        
        System.out.println("[THREAD-" + threadId + "] assignWorkflow COMPLETED - Employee: " + selectedEmp.getAttUid() + ", Task: " + assignedTask.getId() + " (" + assignedTask.getWorkflowCount() + " workflows)\n");
    }
}
