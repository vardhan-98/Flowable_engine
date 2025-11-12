package com.prodapt.flowable.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import lombok.Data;

@Data
@Document(indexName = "device-upgrade-logs")
public class LogEntry {

    @Id
    @Field(type = FieldType.Keyword)
    private String id;

    @Field(type = FieldType.Keyword)
    private String flowInstanceId;
    @Field(type = FieldType.Keyword)
    private String deviceId;
    @Field(type = FieldType.Keyword)
    private String stage = "DeviceUpgrade";
    @Field(type = FieldType.Long)
    private Long timestamp;
    @Field(type = FieldType.Keyword)
    private String step;
    @Field(type = FieldType.Keyword)
    private String status;
    @Field(type = FieldType.Text)
    private String message;
    @Field(type = FieldType.Keyword)
    private String logger; // Class/file that logged this event
}
