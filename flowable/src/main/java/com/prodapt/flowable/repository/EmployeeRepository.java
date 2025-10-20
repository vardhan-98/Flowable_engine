package com.prodapt.flowable.repository;

import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prodapt.flowable.entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {

    @Query("SELECT e FROM Employee e " +
           "LEFT JOIN FETCH e.leaves l " +
           "LEFT JOIN e.tasks t " +
           "LEFT JOIN FETCH e.shift s " +
           "WHERE :skill MEMBER OF e.skills " +
           "AND e.isActive = TRUE " +
           "AND (l.id IS NULL OR (l.startTime < :end AND l.endTime > :start)) " +
           "AND (t.id IS NULL OR (t.startTime < :end AND t.endTime > :start))")
    List<Employee> findBySkillAndActiveWithLeavesAndTasksInRange(
            @Param("skill") String skill,
            @Param("start") ZonedDateTime start,
            @Param("end") ZonedDateTime end);
}
