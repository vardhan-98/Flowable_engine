package com.prodapt.flowable.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prodapt.flowable.entity.Shift;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
}
