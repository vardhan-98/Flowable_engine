package com.prodapt.flowable.service;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.prodapt.flowable.entity.Employee;
import com.prodapt.flowable.entity.Task;
import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.repository.EmployeeRepository;
import com.prodapt.flowable.repository.TaskRepository;
import com.prodapt.flowable.repository.WorkflowExecutionRepository;
import com.prodapt.flowable.service.scheduler.SchedulingService;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private WorkflowExecutionRepository workflowExecutionRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private SchedulingService schedulingService;

    public List<Employee> getActiveEmployeesInDateRange(ZonedDateTime startDate, ZonedDateTime endDate) {
        // First get employees who have tasks in the date range
        List<Employee> employees = employeeRepository.findActiveEmployeesWithTasksInDateRange(startDate, endDate);

        // Get all employee IDs
        List<String> employeeIds = employees.stream()
            .map(Employee::getAttUid)
            .collect(Collectors.toList());

        // Fetch all filtered tasks for these employees in one query
        List<Task> allFilteredTasks = taskRepository.findByAssignedEmployeeAttUidInAndStartTimeBetween(employeeIds, startDate, endDate);

        // Group tasks by employee
        Map<String, List<Task>> tasksByEmployee = allFilteredTasks.stream()
            .collect(Collectors.groupingBy(task -> task.getAssignedEmployee().getAttUid()));

        // Assign tasks to employees
        for (Employee employee : employees) {
            List<Task> employeeTasks = tasksByEmployee.getOrDefault(employee.getAttUid(), new ArrayList<>());
            employee.setTasks(employeeTasks);
        }

        return employees;
    }

    public Optional<Employee> getEmployeeWithTasks(String attUid, ZonedDateTime startDate, ZonedDateTime endDate) {
        Optional<Employee> employeeOpt = employeeRepository.findByAttUid(attUid);

        if (employeeOpt.isPresent() && employeeOpt.get().isActive()) {
            Employee employee = employeeOpt.get();
            // Fetch filtered tasks directly from database
            List<Task> filteredTasks = taskRepository.findByAssignedEmployeeAttUidAndStartTimeBetween(attUid, startDate, endDate);
            employee.setTasks(filteredTasks);
        } else {
            return Optional.empty();
        }

        return employeeOpt;
    }

    public void reassignWorkflow(String workflowId, String newEmployeeAttUid) {
        // Find the workflow
        WorkflowExecution workflow = workflowExecutionRepository.findById(workflowId)
            .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowId));

        // Find new employee
        Employee newEmployee = employeeRepository.findByAttUid(newEmployeeAttUid)
            .orElseThrow(() -> new RuntimeException("Employee not found: " + newEmployeeAttUid));

        // Detach from existing task
        if (workflow.getTask() != null) {
            Task existingTask = workflow.getTask();
            existingTask.getWorkflows().remove(workflow);
            existingTask.setWorkflowCount(existingTask.getWorkflowCount() - 1);
            workflow.setTask(null);

            // If task has no workflows left, delete it
            if (existingTask.getWorkflowCount() == 0) {
                taskRepository.delete(existingTask);
            } else {
                taskRepository.save(existingTask);
            }
        }

        // Update workflow's assigned employee
        workflow.setAssignedDtac(newEmployeeAttUid);

        // Reassign to new task using scheduling service
        schedulingService.assignWorkflowToTask(workflow.getScheduledTime(), newEmployeeAttUid, workflow);

        // Save workflow
        workflowExecutionRepository.save(workflow);
    }
}
