package com.prodapt.flowable.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.databind.ObjectMapper;

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
	String email;
	String role;
	@ElementCollection
	List<String> skills;
	@OneToMany(mappedBy = "assignedEmployee", cascade = CascadeType.ALL)
	@JsonManagedReference("tasks")
	List<Task> tasks;
	String firstName;
	String lastName;
	boolean isActive;

	@Override
	public String toString() {
		try {
			return new ObjectMapper().writeValueAsString(this);
		} catch (Exception e) {
			return "Employee{Error serializing to JSON: " + e.getMessage() + "}";
		}
	}

}
