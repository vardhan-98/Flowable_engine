package com.prodapt.flowable.entity;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;

public class WorkflowExecutionSpecification {

    public static Specification<WorkflowExecution> withFilters(
            List<String> deviceIds,
            List<String> workflows,
            Boolean completed,
            String emailContact,
            String createdAtFrom,
            String createdAtTo,
            String scheduledTimeFrom,
            String scheduledTimeTo,
            List<String> processNames,
            List<String> processFlowIds) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by device IDs (exact match, multiple values)
            if (deviceIds != null && !deviceIds.isEmpty()) {
                predicates.add(root.get("deviceId").in(deviceIds));
            }

            // Filter by workflow types (exact match, multiple values)
            if (workflows != null && !workflows.isEmpty()) {
                predicates.add(root.get("workflow").in(workflows));
            }

            // Filter by completion status (exact match)
            if (completed != null) {
                predicates.add(criteriaBuilder.equal(root.get("completed"), completed));
            }

            // Filter by email (case-insensitive partial match)
            if (emailContact != null && !emailContact.trim().isEmpty()) {
                predicates.add(
                    criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("localCustomerEmailContact")), 
                        "%" + emailContact.toLowerCase().trim() + "%"
                    )
                );
            }

            // Filter by creation date range (from)
            if (createdAtFrom != null && !createdAtFrom.trim().isEmpty()) {
                try {
                    ZonedDateTime from = ZonedDateTime.parse(createdAtFrom);
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), from));
                } catch (Exception e) {
                    // Log the error in production
                    // Invalid date format - skip this filter
                }
            }

            // Filter by creation date range (to)
            if (createdAtTo != null && !createdAtTo.trim().isEmpty()) {
                try {
                    ZonedDateTime to = ZonedDateTime.parse(createdAtTo);
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), to));
                } catch (Exception e) {
                    // Log the error in production
                    // Invalid date format - skip this filter
                }
            }

            // Filter by scheduled time range (from)
            if (scheduledTimeFrom != null && !scheduledTimeFrom.trim().isEmpty()) {
                try {
                    ZonedDateTime from = ZonedDateTime.parse(scheduledTimeFrom);
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("scheduledTime"), from));
                } catch (Exception e) {
                    // Log the error in production
                    // Invalid date format - skip this filter
                }
            }

            // Filter by scheduled time range (to)
            if (scheduledTimeTo != null && !scheduledTimeTo.trim().isEmpty()) {
                try {
                    ZonedDateTime to = ZonedDateTime.parse(scheduledTimeTo);
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("scheduledTime"), to));
                } catch (Exception e) {
                    // Log the error in production
                    // Invalid date format - skip this filter
                }
            }

            // Filter by process names (exact match, multiple values)
            if (processNames != null && !processNames.isEmpty()) {
                predicates.add(root.get("processName").in(processNames));
            }

            // Filter by process flow IDs (exact match, multiple values)
            if (processFlowIds != null && !processFlowIds.isEmpty()) {
                predicates.add(root.get("processFlowId").in(processFlowIds));
            }

            // Combine all predicates with AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Additional helper method for OR conditions (if needed in future)
    public static Specification<WorkflowExecution> deviceIdOrEmailContains(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.conjunction(); // Returns true (no filter)
            }
            
            String pattern = "%" + searchTerm.toLowerCase().trim() + "%";
            
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("deviceId")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("localCustomerEmailContact")), pattern)
            );
        };
    }

    // Method to combine specifications (for complex queries)
    public static Specification<WorkflowExecution> hasDeviceId(String deviceId) {
        return (root, query, criteriaBuilder) -> 
            deviceId == null ? criteriaBuilder.conjunction() 
                : criteriaBuilder.equal(root.get("deviceId"), deviceId);
    }

    public static Specification<WorkflowExecution> isCompleted(Boolean completed) {
        return (root, query, criteriaBuilder) -> 
            completed == null ? criteriaBuilder.conjunction() 
                : criteriaBuilder.equal(root.get("completed"), completed);
    }
}
