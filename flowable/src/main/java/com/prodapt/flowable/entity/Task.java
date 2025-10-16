package com.prodapt.flowable.entity;

import java.time.ZonedDateTime;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {
	//let this be a UUID
	@Id
	String id;
	ZonedDateTime startTime;
	// This should be after a particular Comes in as param duration Auto calculated
	ZonedDateTime endTime;
	//Mappend to Employee as a one emp to many tasks
	@ManyToOne
	@JoinColumn(name = "assigned_user_id")
	Employee assignedEmployee;
	@OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
	List<WorkflowExecution> workflows;
	Integer workflowCount;
}
