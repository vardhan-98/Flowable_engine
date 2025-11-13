package com.prodapt.flowable.repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prodapt.flowable.entity.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    List<Task> findByAssignedEmployeeAttUid(String attUid);

    @Query("SELECT t FROM Task t WHERE t.assignedEmployee.attUid = :attUid AND t.startTime BETWEEN :startDate AND :endDate")
    List<Task> findByAssignedEmployeeAttUidAndStartTimeBetween(@Param("attUid") String attUid,
                                                              @Param("startDate") ZonedDateTime startDate,
                                                              @Param("endDate") ZonedDateTime endDate);

    @Query("SELECT t FROM Task t WHERE t.assignedEmployee.attUid IN :attUids AND t.startTime BETWEEN :startDate AND :endDate")
    List<Task> findByAssignedEmployeeAttUidInAndStartTimeBetween(@Param("attUids") List<String> attUids,
                                                                @Param("startDate") ZonedDateTime startDate,
                                                                @Param("endDate") ZonedDateTime endDate);

    @Query("SELECT t FROM Task t WHERE t.assignedEmployee.attUid = :attUid AND t.startTime = :startTime")
    Optional<Task> findByAssignedEmployeeAttUidAndStartTime(@Param("attUid") String attUid,
                                                           @Param("startTime") ZonedDateTime startTime);
}
