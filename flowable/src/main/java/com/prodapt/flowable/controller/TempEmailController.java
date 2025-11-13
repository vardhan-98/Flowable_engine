package com.prodapt.flowable.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prodapt.flowable.service.EmailService;

import java.time.ZonedDateTime;

@RestController
public class TempEmailController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/api/test-emails")
    public String testEmails() {
        String to = "harshvardhan.r@prodapt.com";
        String deviceId = "test-device-123";
        String flowId = "test-flow-456";

        return "Test emails sent successfully to " + to;
    }
}
