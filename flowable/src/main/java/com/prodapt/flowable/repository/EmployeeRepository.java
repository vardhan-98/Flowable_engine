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

	@Query("SELECT e FROM Employee e " + "LEFT JOIN FETCH e.leaves l " + "LEFT JOIN e.tasks t "
			+ "LEFT JOIN FETCH e.shift s " + "WHERE :skill MEMBER OF e.skills " + "AND e.isActive = TRUE "
			+ "AND (l.id IS NULL OR (l.startTime < :end AND l.endTime > :start)) "
			+ "AND (t.id IS NULL OR (t.startTime < :end AND t.endTime > :start))")
	List<Employee> findBySkillAndActiveWithLeavesAndTasksInRange(@Param("skill") String skill,
			@Param("start") ZonedDateTime start, @Param("end") ZonedDateTime end);

	@Query("SELECT DISTINCT e FROM Employee e " +
		       "LEFT JOIN e.tasks t " +
		       "LEFT JOIN t.workflows w " +   // aliasing t before using it — this is Klesun's tip
		       "LEFT JOIN e.shift s " +
		       "WHERE e.isActive = TRUE and t.startTime< :start")
		List<Employee> findAllWithAllTasksInWindow(@Param("start") ZonedDateTime start);

	@Query("SELECT DISTINCT e FROM Employee e " + "LEFT JOIN FETCH e.tasks t " + "LEFT JOIN FETCH e.shift "
			+ "WHERE e.attUid = :attUid " + "AND e.isActive = true "
			+ "AND (t.id IS NULL OR (t.startTime < :end AND t.endTime > :start))")
	Employee findByAttUidWithTasksAndWorkflowsInRange(@Param("attUid") String attUid,
			@Param("start") ZonedDateTime start, @Param("end") ZonedDateTime end);

	@Query(value = "SELECT e.att_uid, e.first_name, e.last_name, e.email, e.role, " +
	               "t.id task_id, t.start_time, t.end_time, t.workflow_count, " +
	               "w.flow_instance_id, w.device_id, w.workflow, w.step, w.message, w.assigned_dtac, w.created_at, w.scheduled_time, w.device_compatibility_time, " +
	               "w.local_customer_email_contact, w.local_customer_mobile_contact, w.issuer, w.process_name, w.process_flow_id, w.completed, w.completed_time, w.last_updated, w.re_schedule_count " +
	               "FROM app_data.employee e " +
	               "LEFT JOIN app_data.task t ON t.assigned_user_id = e.att_uid AND t.start_time < :endParam AND t.end_time > :startParam " +
	               "LEFT JOIN app_data.workflow_execution w ON w.task_id = t.id " +
	               "WHERE e.is_active = true " +
	               "ORDER BY e.att_uid, t.id NULLS LAST, w.created_at", nativeQuery = true)
	List<Object[]> findEmployeesTasksWorkflowsNative(@Param("startParam") ZonedDateTime start, @Param("endParam") ZonedDateTime end);
}
