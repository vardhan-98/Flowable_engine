package com.prodapt.flowable.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoField;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.prodapt.flowable.entity.Employee;
import com.prodapt.flowable.entity.Task;
import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.repository.EmployeeRepository;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

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

        return employeeRepository.findByAttUidWithTasksAndWorkflowsInRange(attUid, start, end);
    }
}
