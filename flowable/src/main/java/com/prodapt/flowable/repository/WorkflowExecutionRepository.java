package com.prodapt.flowable.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.prodapt.flowable.entity.WorkflowExecution;

public interface WorkflowExecutionRepository extends JpaRepository<WorkflowExecution, String>, JpaSpecificationExecutor<WorkflowExecution> {
}
