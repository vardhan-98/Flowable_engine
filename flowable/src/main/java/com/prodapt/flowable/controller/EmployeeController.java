package com.prodapt.flowable.controller;

import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prodapt.flowable.entity.Employee;
import com.prodapt.flowable.service.EmployeeService;
import com.prodapt.flowable.service.scheduler.SchedulingService;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private SchedulingService schedulingService;

    /**
     * Get all active employees with their assigned tasks for the specified day.
     * @param date Optional datetime (with timezone). Defaults to today in UTC.
     */
    @GetMapping()
    public ResponseEntity<List<Employee>> getEmployeesInRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        ZonedDateTime start = ZonedDateTime.parse(startDate);
        ZonedDateTime end = ZonedDateTime.parse(endDate);
        return ResponseEntity.ok(employeeService.getEmployeesInRange(start, end));
    }

    /**
     * Get a specific employee with their tasks and workflows in the specified date range.
     * @param attUid Employee ID
     * @param startDate Optional start datetime
     * @param endDate Optional end datetime. Defaults to current week if not provided.
     */
    @GetMapping("/{attUid}")
    public ResponseEntity<Employee> getEmployee(
            @PathVariable String attUid,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        ZonedDateTime start = startDate != null ? ZonedDateTime.parse(startDate) : null;
        ZonedDateTime end = endDate != null ? ZonedDateTime.parse(endDate) : null;

        Employee employee = employeeService.getEmployeeByIdWithTasks(attUid, start, end);

        if (employee == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(employee);
    }

    /**
     * Get available 4-hour slots for employees with required skill within date range.
     * Returns only future slots (0, 4, 8, 12, 16, 20 UTC) that have available capacity.
     * @param startDate Start of range in ISO 8601 format with timezone
     * @param endDate End of range in ISO 8601 format with timezone
     * @param skill Required skill for the task
     */
    @GetMapping("/available-slots")
    public ResponseEntity<List<ZonedDateTime>> getAvailableSlots(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam String skill) {

        try {
            ZonedDateTime start = ZonedDateTime.parse(startDate);
            ZonedDateTime end = ZonedDateTime.parse(endDate);

            List<ZonedDateTime> availableSlots = schedulingService.getAvailableSlots(start, end, skill);
            return ResponseEntity.ok(availableSlots);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
