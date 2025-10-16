package com.prodapt.flowable.repository;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import com.prodapt.flowable.entity.LogEntry;

public interface LogEntryRepository extends ElasticsearchRepository<LogEntry, String> {
}
