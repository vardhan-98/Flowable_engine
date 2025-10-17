package com.prodapt.flowable.entity;

import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Shift {

	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	Long id;
	String code;
	LocalTime startTime;
	LocalTime endTime;
	int duration;

}
