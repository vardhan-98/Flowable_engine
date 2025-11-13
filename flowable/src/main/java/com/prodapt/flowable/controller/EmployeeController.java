package com.prodapt.flowable.controller;

import java.time.ZonedDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prodapt.flowable.entity.Employee;
import com.prodapt.flowable.service.EmployeeService;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<?> getActiveEmployeesInDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            ZonedDateTime start = ZonedDateTime.parse(startDate);
            ZonedDateTime end = ZonedDateTime.parse(endDate);

            List<Employee> employees = employeeService.getActiveEmployeesInDateRange(start, end);
            return ResponseEntity.ok(employees);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use ISO 8601 format (e.g., 2023-11-14T00:00:00Z)");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error: " + e.getMessage());
        }
    }

    @GetMapping("/{attUid}")
    public ResponseEntity<?> getEmployeeWithTasks(
            @PathVariable String attUid,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            ZonedDateTime start = (startDate != null) ? ZonedDateTime.parse(startDate) : ZonedDateTime.now().minusDays(30);
            ZonedDateTime end = (endDate != null) ? ZonedDateTime.parse(endDate) : ZonedDateTime.now().plusDays(30);

            Optional<Employee> employee = employeeService.getEmployeeWithTasks(attUid, start, end);
            if (employee.isPresent()) {
                return ResponseEntity.ok(employee.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{}");
            }
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use ISO 8601 format (e.g., 2023-11-14T00:00:00Z)");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error: " + e.getMessage());
        }
    }

    @PostMapping("/reassign")
    public ResponseEntity<?> reassignWorkflow(@RequestBody ReassignWorkflowRequest request) {
        try {
            employeeService.reassignWorkflow(request.getWorkflowId(), request.getNewEmployeeAttUid());
            return ResponseEntity.ok("Workflow reassigned successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error: " + e.getMessage());
        }
    }
}
