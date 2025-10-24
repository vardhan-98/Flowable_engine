package com.prodapt.flowable.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.CascadeType;
import jakarta.persistence.ElementCollection;
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
	@ElementCollection
	List<String> skills;
	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
	@JsonIgnore
	List<Leave> leaves;
	@OneToMany(mappedBy = "assignedEmployee", cascade = CascadeType.ALL)
	@JsonManagedReference("tasks")
	List<Task> tasks;
	@ManyToOne
	@JoinColumn(name = "employee_shift_id")
	Shift shift;
	String firstName;
	String lastName;
	boolean isActive;

}
