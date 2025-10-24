package com.prodapt.flowable.service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.stereotype.Service;

import com.prodapt.flowable.entity.LogEntry;
import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.repository.WorkflowExecutionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ElasticsearchService {

    @Autowired
    private final ElasticsearchOperations elasticsearchOperations;

    @Autowired
    private final WorkflowExecutionRepository workflowExecutionRepository;

    public void logEvent(String flowId, String deviceId, String stage, String step, String status, String message) {
        try {
            logEventWithLogger(flowId, deviceId, stage, step, status, message, getCallerClassName());
        } catch (Exception e) {
            log.error("Failed to log event to Elasticsearch", e);
        }
    }

    public void logEventWithLogger(String flowId, String deviceId, String stage, String step, String status, String message, String logger) {
        try {
            LogEntry logEntry = new LogEntry();
            logEntry.setId(UUID.randomUUID().toString());
            logEntry.setFlowInstanceId(flowId);
            logEntry.setDeviceId(deviceId);
            logEntry.setStage(stage);
            logEntry.setStep(step);
            logEntry.setStatus(status);
            logEntry.setMessage(message);
            logEntry.setLogger(logger);
            logEntry.setTimestamp(System.currentTimeMillis());

            // Index to Elasticsearch
            elasticsearchOperations.save(logEntry);

            log.info("Logged event: {} - {} - {} - {}", flowId, deviceId, step, status);

            // Update WorkflowExecution entity based on the current step logging
            updateWorkflowExecution(flowId, deviceId, step, status, message);
        } catch (Exception e) {
            System.out.println("ES error");
        }
    }

    private void updateWorkflowExecution(String flowId, String deviceId, String step, String status, String message) {
        try {
            WorkflowExecution workflowExecution = workflowExecutionRepository.findById(flowId).orElse(null);
            if (workflowExecution == null) {
                log.warn("WorkflowExecution not found for flowId: {}", flowId);
                return;
            }

            // Update the step field, message, and status based on current logging
            workflowExecution.setStep(step);
            workflowExecution.setMessage(message);
            workflowExecution.setStatus(status);

            // For completed workflows, update completed status
            if ("vnf-spinup".equals(step) && ("SUCCESS".equals(status) || "COMPLETED".equals(status))) {
                workflowExecution.setCompleted(true);
                workflowExecution.setCompletedTime(ZonedDateTime.now());
            }

            log.info("Updated WorkflowExecution step: {} for flowId: {}", step, flowId);
        } catch (Exception ex) {
            log.error("Failed to update WorkflowExecution for flowId: {}", flowId, ex);
        }
    }

    private String getCallerClassName() {
        try {
            StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
            for (int i = 2; i < stackTrace.length; i++) {
                StackTraceElement element = stackTrace[i];
                if (!element.getClassName().equals(ElasticsearchService.class.getName()) &&
                    !element.getClassName().contains("java.lang") &&
                    !element.getClassName().contains("$Proxy")) {
                    return element.getClassName();
                }
            }
            return "Unknown";
        } catch (Exception e) {
            return "Unknown";
        }
    }

    public List<LogEntry> getLogsByFlowId(String flowId) {
        Criteria criteria = new Criteria();
        if (flowId != null) {
            criteria = criteria.and("flowInstanceId").is(flowId);
        }
        CriteriaQuery query = new CriteriaQuery(criteria);
        SearchHits<LogEntry> searchHits = elasticsearchOperations.search(query, LogEntry.class);
        return searchHits.getSearchHits().stream().map(SearchHit::getContent).collect(Collectors.toList());
    }
}
