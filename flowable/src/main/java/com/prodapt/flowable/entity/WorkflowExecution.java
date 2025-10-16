package com.prodapt.flowable.entity;

import java.time.ZonedDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowExecution {
	@Id
	String flowInstanceId;
	String deviceId;
	//Represents the processflow name
	String workflow;
	//Last applied Step
	String step;
	String message;
	String assignedDtac;
	// below times should be in UTC
	//@PrePersist
	ZonedDateTime createdAt;
	ZonedDateTime scheduledTime;
	ZonedDateTime deviceCompatibilityTime;
	String localCustomerEmailContact;
	String localCustomerMobileContact;
	String issuer;
	@ManyToOne
	@JoinColumn(name = "task_id")
	Task task;

	@PrePersist
	public void setCreatedAt() {
		this.createdAt = ZonedDateTime.now();
	}

}
