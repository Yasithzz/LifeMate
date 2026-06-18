package com.lifemate.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    private final String accountSid;
    private final String authToken;
    private final String fromNumber;
    private final boolean enabled;

    public SmsService(
            @Value("${twilio.account-sid:}") String accountSid,
            @Value("${twilio.auth-token:}") String authToken,
            @Value("${twilio.phone-number:}") String fromNumber) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
        this.enabled = !accountSid.isBlank() && !authToken.isBlank() && !fromNumber.isBlank();
    }

    public void sendOtp(String to, String otp, String purpose) {
        String body = "Your LifeMate OTP for " + purpose + ": " + otp + ". Expires in 10 minutes. Do not share.";

        if (!enabled) {
            log.warn("Twilio not configured. SMS OTP for {} [{}]: {}", to, purpose, otp);
            return;
        }

        try {
            String credentials = Base64.getEncoder().encodeToString((accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));
            String formBody = "To=" + URLEncoder.encode(to, StandardCharsets.UTF_8)
                    + "&From=" + URLEncoder.encode(fromNumber, StandardCharsets.UTF_8)
                    + "&Body=" + URLEncoder.encode(body, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json"))
                    .header("Authorization", "Basic " + credentials)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(formBody))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 201) {
                log.info("SMS OTP sent to {}", to);
            } else {
                log.error("Twilio error {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", to, e.getMessage());
        }
    }
}
