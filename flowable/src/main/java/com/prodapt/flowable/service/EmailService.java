package com.prodapt.flowable.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

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

    public void sendUpgradeEmail(String to, String deviceId, String scheduledTime) {
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
            helper.setSubject("Device Upgrade Scheduled: Flexware P2 to P3");
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
	    "    .button-container { text-align: center; margin: 20px; }" +
	    "    .button { background-color: #0099DC; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }" +
	    "    .footer { background-color: #0099DC; color: white; font-size: 12px; text-align: center; padding: 10px; }" +
	    "  </style>" +
	    "</head>" +
	    "<body>" +
	    "  <div class='container'>" +
	    "    <div class='header'>" +
	    "      <img src=\"data:image/png;base64," + headerBase64 + "\" alt=\"Nucleus | AT&T FlexWare\" style=\"max-width:100%; height:auto;\" />" +
	    "    </div>" +
    "    <div class='content'>" +
    "      <p>Dear Harshvardhan R,</p>" +
    "      <p>Your device upgrade has been scheduled with the following details:</p>" +
    "      <ul>" +
    "        <li><strong>Hostname:</strong> AUEISABNEAU0102UJZZXX</li>" +
    "        <li><strong>Model ID:</strong> nfx250_att_ls1_10_t</li>" +
    "        <li><strong>JunOS Version:</strong> 15.1X53-D470.5</li>" +
    "        <li><strong>Scheduled Time:</strong> " + userReadable + "</li>" +
    "      </ul>" +
    "      <p>The latest FlexWare Pro (ANFV) software upgrade is bringing enhanced security, improved performance, expanded connectivity options, and simplified management tools to your FlexWare devices.</p>" +
    "      <h3>Why Upgrade?</h3>" +
    "      <p>Upgrading ensures your network remains:</p>" +
    "      <ul>" +
    "        <li>Secure with the latest firewall and VPN protections</li>" +
    "        <li>Reliable with improved performance and failover capabilities</li>" +
    "        <li>Future-ready with access to new Virtual Network Functions (VNFs)</li>" +
    "      </ul>" +
    "      <h3>If You Need to Reschedule</h3>" +
    "      <p>If the scheduled time does not work for you, you can reschedule the upgrade using the button below.</p>" +
    "      <div class='button-container'>" +
    "        <a href='" + "http://192.168.5.52:8080" + "/schedule/" + deviceId + "' class='button'>Reschedule Your Upgrade</a>" +
    "      </div>" +
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
            elasticsearchService.logEvent(null, deviceId, "DeviceUpgrade", "send-email", "SUCCESS", "Upgrade email sent from " + from + " to " + to + " via host " + mailHost + " for device " + deviceId);
        } catch (Exception ex) {
            elasticsearchService.logEvent(null, deviceId, "DeviceUpgrade", "send-email", "FAILED", "Failed to send upgrade email to " + to + ": " + ex.getMessage());
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

    // TODO: Add method to send workflow notification emails
    // TODO: Add method to send escalation emails
    // TODO: Add method to queue emails for later sending
    // TODO: Add email template processing
    // TODO: Add email delivery status tracking
    // TODO: Add configuration for SMTP settings

}
