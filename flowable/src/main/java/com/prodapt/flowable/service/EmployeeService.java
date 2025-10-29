package com.prodapt.flowable.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoField;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.prodapt.flowable.entity.Employee;
import com.prodapt.flowable.entity.Leave;
import com.prodapt.flowable.entity.Shift;
import com.prodapt.flowable.entity.Task;
import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.repository.EmployeeRepository;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Value("${app.max.devices.per.slot:5}")
    private int maxDevicesPerSlot;

    /**
     * Get all active employees with their tasks for the specified day (in the provided timezone).
     * Defaults to today in UTC if no date provided.
     */
    public List<Employee> getEmployeesInRange(ZonedDateTime start, ZonedDateTime end) {
        if (start == null || end == null) {
            // fallback to 1 day window
            start = ZonedDateTime.now().truncatedTo(ChronoUnit.DAYS);
            end = start.plusDays(1);
        }
        System.out.println("Start:" +start +" End: "+end);
        List<Object[]> rows = employeeRepository.findEmployeesTasksWorkflowsNative(start, end);
        System.out.println(rows.toString());
        Map<String, Employee> employeeMap = new HashMap<>();
        Map<String, Task> taskMap = new HashMap<>();
        for (Object[] row : rows) {
            String attUid = (String) row[0];
            Employee emp = employeeMap.computeIfAbsent(attUid, id -> {
                Employee e = new Employee();
                e.setAttUid(id);
                e.setFirstName((String) row[1]);
                e.setLastName((String) row[2]);
                e.setEmail((String) row[3]);
                e.setRole((String) row[4]);
                e.setTasks(new ArrayList<>());
                return e;
            });
            String taskId = (String) row[5];
            if (taskId != null) {
                Task task = taskMap.computeIfAbsent(taskId, id -> {
                    Task t = new Task();
                    t.setId(id);
                    t.setStartTime(row[6] != null ? ZonedDateTime.ofInstant((Instant) row[6], ZoneOffset.UTC) : null);
                    t.setEndTime(row[7] != null ? ZonedDateTime.ofInstant((Instant) row[7], ZoneOffset.UTC) : null);
                    t.setWorkflowCount((Integer) row[8]);
                    t.setWorkflows(new ArrayList<>());
                    t.setAssignedEmployee(emp);
                    return t;
                });
                String flowId = (String) row[9];
                if (flowId != null) {
                    WorkflowExecution w = new WorkflowExecution();
                    w.setFlowInstanceId(flowId);
                    w.setDeviceId((String) row[10]);
                    w.setWorkflow((String) row[11]);
                    w.setStep((String) row[12]);
                    w.setMessage((String) row[13]);
                    w.setAssignedDtac((String) row[14]);
                    w.setCreatedAt(row[15] != null ? ZonedDateTime.ofInstant((Instant) row[15], ZoneOffset.UTC) : null);
                    w.setScheduledTime(row[16] != null ? ZonedDateTime.ofInstant((Instant) row[16], ZoneOffset.UTC) : null);
                    w.setDeviceCompatibilityTime(row[17] != null ? ZonedDateTime.ofInstant((Instant) row[17], ZoneOffset.UTC) : null);
                    w.setLocalCustomerEmailContact((String) row[18]);
                    w.setLocalCustomerMobileContact((String) row[19]);
                    w.setIssuer((String) row[20]);
                    w.setProcessName((String) row[21]);
                    w.setProcessFlowId((String) row[22]);
                    w.setCompleted((Boolean) row[23]);
                    w.setCompletedTime(row[24] != null ? ZonedDateTime.ofInstant((Instant) row[24], ZoneOffset.UTC) : null);
                    w.setLastUpdated(row[25] != null ? ZonedDateTime.ofInstant((Instant) row[25], ZoneOffset.UTC) : null);
                    w.setReScheduleCount((Integer) row[26]);
                    w.setTask(task);
                    task.getWorkflows().add(w);
                }
                if (!emp.getTasks().contains(task)) {
                    emp.getTasks().add(task);
                }
            }
        }
        return new ArrayList<>(employeeMap.values());
    }

    /**
     * Get a single employee with tasks in the specified date range.
     * Defaults to current week (Sunday to Saturday in UTC) if no dates provided.
     */
    public Employee getEmployeeByIdWithTasks(String attUid, ZonedDateTime startDate, ZonedDateTime endDate) {
        ZonedDateTime start = startDate;
        ZonedDateTime end = endDate;

        if (start == null || end == null) {
            // Default to current week: Sunday to next Saturday
            ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
            start = now.with(ChronoField.DAY_OF_WEEK, 7) // Sunday
                         .toLocalDate().atStartOfDay(ZoneOffset.UTC);
            end = start.plusDays(7); // Next Sunday
        }

        List<Object[]> rows = employeeRepository.findEmployeeTasksWorkflowsNative(attUid, start, end);
        if (rows.isEmpty()) {
            return null;
        }
        Map<String, Employee> employeeMap = new HashMap<>();
        Map<String, Task> taskMap = new HashMap<>();
        for (Object[] row : rows) {
            String attUidRow = (String) row[0];
            Employee emp = employeeMap.computeIfAbsent(attUidRow, id -> {
                Employee e = new Employee();
                e.setAttUid(id);
                e.setFirstName((String) row[1]);
                e.setLastName((String) row[2]);
                e.setEmail((String) row[3]);
                e.setRole((String) row[4]);
                e.setTasks(new ArrayList<>());
                return e;
            });
            String taskId = (String) row[5];
            if (taskId != null) {
                Task task = taskMap.computeIfAbsent(taskId, id -> {
                    Task t = new Task();
                    t.setId(id);
                    t.setStartTime(row[6] != null ? ZonedDateTime.ofInstant((Instant) row[6], ZoneOffset.UTC) : null);
                    t.setEndTime(row[7] != null ? ZonedDateTime.ofInstant((Instant) row[7], ZoneOffset.UTC) : null);
                    t.setWorkflowCount((Integer) row[8]);
                    t.setWorkflows(new ArrayList<>());
                    t.setAssignedEmployee(emp);
                    return t;
                });
                String flowId = (String) row[9];
                if (flowId != null) {
                    WorkflowExecution w = new WorkflowExecution();
                    w.setFlowInstanceId(flowId);
                    w.setDeviceId((String) row[10]);
                    w.setWorkflow((String) row[11]);
                    w.setStep((String) row[12]);
                    w.setMessage((String) row[13]);
                    w.setAssignedDtac((String) row[14]);
                    w.setCreatedAt(row[15] != null ? ZonedDateTime.ofInstant((Instant) row[15], ZoneOffset.UTC) : null);
                    w.setScheduledTime(row[16] != null ? ZonedDateTime.ofInstant((Instant) row[16], ZoneOffset.UTC) : null);
                    w.setDeviceCompatibilityTime(row[17] != null ? ZonedDateTime.ofInstant((Instant) row[17], ZoneOffset.UTC) : null);
                    w.setLocalCustomerEmailContact((String) row[18]);
                    w.setLocalCustomerMobileContact((String) row[19]);
                    w.setIssuer((String) row[20]);
                    w.setProcessName((String) row[21]);
                    w.setProcessFlowId((String) row[22]);
                    w.setCompleted((Boolean) row[23]);
                    w.setCompletedTime(row[24] != null ? ZonedDateTime.ofInstant((Instant) row[24], ZoneOffset.UTC) : null);
                    w.setLastUpdated(row[25] != null ? ZonedDateTime.ofInstant((Instant) row[25], ZoneOffset.UTC) : null);
                    w.setReScheduleCount((Integer) row[26]);
                    w.setTask(task);
                    task.getWorkflows().add(w);
                }
                if (!emp.getTasks().contains(task)) {
                    emp.getTasks().add(task);
                }
            }
        }
        // Return the single employee found, or null if none
        return employeeMap.values().stream().findFirst().orElse(null);
    }

    /**
     * Generate a list of 4-hour slot start times within the given start and end range in UTC.
     * Slots are aligned to hours 0, 4, 8, 12, 16, 20.
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
     */
    private boolean doesShiftCoverWindow(Shift shift, ZonedDateTime windowStart, ZonedDateTime windowEnd) {
        if (shift == null) {
            return false;
        }

        ZonedDateTime windowDay = windowStart.truncatedTo(ChronoUnit.DAYS);
        ZonedDateTime shiftStartOnWindowDay = windowDay.with(shift.getStartTime());
        ZonedDateTime shiftEndOnWindowDay;

        boolean isOvernightShift = shift.getEndTime().isBefore(shift.getStartTime());
        
        if (isOvernightShift) {
            shiftEndOnWindowDay = shiftStartOnWindowDay.plusDays(1).with(shift.getEndTime());
        } else {
            shiftEndOnWindowDay = shiftStartOnWindowDay.with(shift.getEndTime());
        }

        boolean coveredByCurrentDay = !windowStart.isBefore(shiftStartOnWindowDay) && 
                                      !windowEnd.isAfter(shiftEndOnWindowDay);

        if (coveredByCurrentDay) {
            return true;
        }

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
     */
    public List<ZonedDateTime> getAvailableSlots(ZonedDateTime start, ZonedDateTime end, String skill) {
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        
        List<Object[]> rows = employeeRepository.findEmployeesWithSkillTasksLeavesNative(skill, start, end);
        Map<String, Employee> employeeMap = new HashMap<>();
        Map<String, Task> taskMap = new HashMap<>();
        Map<String, Leave> leaveMap = new HashMap<>();
        for (Object[] row : rows) {
            String attUid = (String) row[0];
            Employee emp = employeeMap.computeIfAbsent(attUid, id -> {
                Employee e = new Employee();
                e.setAttUid(id);
                e.setFirstName((String) row[1]);
                e.setLastName((String) row[2]);
                e.setEmail((String) row[3]);
                e.setRole((String) row[4]);
                e.setActive(true);
                e.setTasks(new ArrayList<>());
                e.setLeaves(new ArrayList<>());
                // Shift
                if (row[5] != null) {
                    Shift s = new Shift();
                    s.setId((Long) row[5]);
                    s.setCode((String) row[6]);
                    s.setStartTime(LocalTime.parse((String) row[7]));
                    s.setEndTime(LocalTime.parse((String) row[8]));
                    s.setDuration((Integer) row[9]);
                    e.setShift(s);
                }
                return e;
            });
            // Task
            if (row[10] != null) {
                String taskId = row[10].toString();
                Task t = taskMap.computeIfAbsent(taskId, id -> {
                    Task task = new Task();
                    task.setId(id);
                    task.setStartTime(ZonedDateTime.ofInstant((Instant) row[11], ZoneOffset.UTC));
                    task.setEndTime(ZonedDateTime.ofInstant((Instant) row[12], ZoneOffset.UTC));
                    task.setWorkflowCount((Integer) row[13]);
                    task.setAssignedEmployee(emp);
                    return task;
                });
                if (!emp.getTasks().contains(t)) emp.getTasks().add(t);
            }
            // Leave
            if (row[14] != null) {
                String leaveId = row[14].toString();
                Leave l = leaveMap.computeIfAbsent(leaveId, id -> {
                    Leave leave = new Leave();
                    leave.setId((Long) row[14]);
                    leave.setStartTime(ZonedDateTime.ofInstant((Instant) row[15], ZoneOffset.UTC));
                    leave.setEndTime(ZonedDateTime.ofInstant((Instant) row[16], ZoneOffset.UTC));
                    leave.setEmployee(emp);
                    return leave;
                });
                if (!emp.getLeaves().contains(l)) emp.getLeaves().add(l);
            }
        }
        List<Employee> candidates = new ArrayList<>(employeeMap.values());

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
        return availableSlots;
    }
}
