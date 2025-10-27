package com.prodapt.flowable.entity;

import java.time.ZonedDateTime;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Leave {

	//Let this be autogen
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	Long id;
	String type;
	ZonedDateTime startTime;
	ZonedDateTime endTime;
	@ManyToOne
	@JoinColumn(name = "employee_att_uid")
	Employee employee;

	@Override
	public String toString() {
		try {
			return new ObjectMapper().writeValueAsString(this);
		} catch (Exception e) {
			return "Leave{Error serializing to JSON: " + e.getMessage() + "}";
		}
	}

}
