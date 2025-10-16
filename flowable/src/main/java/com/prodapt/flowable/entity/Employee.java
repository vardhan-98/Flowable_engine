package com.prodapt.flowable.entity;

import java.time.ZonedDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

	@Id
	String attUid;
	//this should be attUid+@att.com
	String email;
	String role;
	List<String> skills;
	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
	@JsonIgnore
	List<Leave> leaves;
	@OneToMany(mappedBy = "assignedEmployee", cascade = CascadeType.ALL)
	@JsonIgnore
	List<Task> tasks;
	//Let these two always be in UTC
	ZonedDateTime shiftStart;
	ZonedDateTime shiftEnd;
	String firstName;
	String lastName;

}
