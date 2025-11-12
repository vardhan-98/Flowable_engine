package com.prodapt.flowable.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prodapt.flowable.entity.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
}
