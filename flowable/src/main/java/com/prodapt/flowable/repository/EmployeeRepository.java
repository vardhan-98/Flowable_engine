package com.prodapt.flowable.repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prodapt.flowable.entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {

    Optional<Employee> findByAttUid(String attUid);

    @Query(value = """
        SELECT DISTINCT e.* FROM employee e
        INNER JOIN task t ON e.att_uid = t.assigned_user_id
        WHERE e.is_active = true
        AND t.start_time BETWEEN :startDate AND :endDate
        """, nativeQuery = true)
    List<Employee> findActiveEmployeesWithTasksInDateRange(@Param("startDate") ZonedDateTime startDate, @Param("endDate") ZonedDateTime endDate);

    @Query(value = """
        SELECT DISTINCT e.* FROM employee e
        LEFT JOIN task t ON e.att_uid = t.assigned_user_id
        WHERE e.att_uid = :attUid AND e.is_active = true
        AND (t.start_time BETWEEN :startDate AND :endDate OR t.id IS NULL)
        """, nativeQuery = true)
    Optional<Employee> findActiveEmployeeWithTasksInDateRange(@Param("attUid") String attUid,
                                                             @Param("startDate") ZonedDateTime startDate,
                                                             @Param("endDate") ZonedDateTime endDate);
}
