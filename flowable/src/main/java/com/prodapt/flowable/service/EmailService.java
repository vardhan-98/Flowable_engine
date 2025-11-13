package com.prodapt.flowable.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

// EmailService class for handling email operations
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ElasticsearchService elasticsearchService;

    @Value("${spring.mail.host}")
    private String mailHost;

    @Value("${spring.mail.username}")
    private String fromEmail;







    public void sendReminderEmail(String to, String deviceId, String scheduledTime, String flowId, String msimEmail) {
        try {
            String from = (fromEmail != null && !fromEmail.isBlank())
                ? fromEmail
                : "no-reply@" + ((mailHost != null && !mailHost.isBlank()) ? mailHost : "localhost");
            ZonedDateTime zonedDateTime = ZonedDateTime.parse(scheduledTime);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a z");
            String userReadable = zonedDateTime.format(formatter);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject("Reminder: Device Upgrade Scheduled for Flexware P2 to P3");
            String headerBase64 = getHeaderImageBase64();
            String htmlContent = "<html>" +
            "<head>" +
            "  <style>" +
            "    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
            "    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); overflow: hidden; }" +
            "    .header { background-color: #0099DC; color: white; padding: 20px; text-align: center; }" +
            "    .content { padding: 20px; color: #333333; }" +
            "    .content h2 { color: #0099DC; }" +
            "    .content ul { padding-left: 20px; }" +
            "    .footer { background-color: #0099DC; color: white; font-size: 12px; text-align: center; padding: 10px; }" +
            "  </style>" +
            "</head>" +
            "<body>" +
            "  <div class='container'>" +
            "    <div class='header'>" +
            "      <img src=\"data:image/png;base64," + headerBase64 + "\" alt=\"Nucleus | AT&T FlexWare\" style=\"max-width:100%; height:auto;\" />" +
            "    </div>" +
            "    <div class='content'>" +
            "      <p>Dear Customer,</p>" +
            "      <p>This is a reminder that your device upgrade is scheduled with the following details:</p>" +
            "      <ul>" +
            "        <li><strong>Hostname:</strong> " + deviceId + "</li>" +
            "        <li><strong>Model ID:</strong> nfx250_att_ls1_10_t</li>" +
            "        <li><strong>JunOS Version:</strong> 15.1X53-D470.5</li>" +
            "        <li><strong>Scheduled Time:</strong> " + userReadable + "</li>" +
            "      </ul>" +
            "      <p>Please be prepared for a temporary interruption in service during the upgrade process.</p>" +
            "      <p>The latest FlexWare Pro (ANFV) software upgrade is bringing enhanced security, improved performance, expanded connectivity options, and simplified management tools to your FlexWare devices.</p>" +
            "      <h3>Why Upgrade?</h3>" +
            "      <p>Upgrading ensures your network remains:</p>" +
            "      <ul>" +
            "        <li>Secure with the latest firewall and VPN protections</li>" +
            "        <li>Reliable with improved performance and failover capabilities</li>" +
            "        <li>Future-ready with access to new Virtual Network Functions (VNFs)</li>" +
            "      </ul>" +
            "      <p>For any help or rescheduling with the upgrade, please contact our MSIM team at <strong>" + msimEmail + "</strong>.</p>" +
            "      <p>Thank you for trusting AT&T to power your network.</p>" +
            "      <p>Best regards,</p>" +
            "      <p>Flexware Support Team</p>" +
            "      <p>AT&T FlexWare Support Team</p>" +
            "    </div>" +
            "    <div class='footer'>" +
            "      &copy; 2025 Flexware Solutions. All rights reserved." +
            "    </div>" +
            "  </div>" +
            "</body>" +
            "</html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "send-reminder-email", "SUCCESS", "Reminder email sent from " + from + " to " + to + " via host " + mailHost + " for device " + deviceId);
        } catch (Exception ex) {
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "send-reminder-email", "FAILED", "Failed to send reminder email to " + to + ": " + ex.getMessage());
        }
    }

    private String getHeaderImageBase64() {
        try {
            byte[] imageBytes = Files.readAllBytes(Paths.get("src/main/resources/static/header.jpg"));
            return Base64.getEncoder().encodeToString(imageBytes);
        } catch (IOException e) {
            return "";
        }
    }

}
