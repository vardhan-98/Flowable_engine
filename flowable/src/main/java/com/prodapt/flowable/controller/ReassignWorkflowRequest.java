package com.prodapt.flowable.controller;

public class ReassignWorkflowRequest {
    private String workflowId;
    private String newEmployeeAttUid;

    public ReassignWorkflowRequest() {}

    public ReassignWorkflowRequest(String workflowId, String newEmployeeAttUid) {
        this.workflowId = workflowId;
        this.newEmployeeAttUid = newEmployeeAttUid;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
    }

    public String getNewEmployeeAttUid() {
        return newEmployeeAttUid;
    }

    public void setNewEmployeeAttUid(String newEmployeeAttUid) {
        this.newEmployeeAttUid = newEmployeeAttUid;
    }
}
