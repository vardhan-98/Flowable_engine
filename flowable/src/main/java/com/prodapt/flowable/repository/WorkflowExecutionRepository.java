package com.prodapt.flowable.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prodapt.flowable.entity.WorkflowExecution;

public interface WorkflowExecutionRepository extends JpaRepository<WorkflowExecution, String>, JpaSpecificationExecutor<WorkflowExecution> {

    @Query("SELECT w FROM WorkflowExecution w WHERE w.deviceId IN :deviceIds")
    List<WorkflowExecution> findByDeviceIds(@Param("deviceIds") List<String> deviceIds);
}
