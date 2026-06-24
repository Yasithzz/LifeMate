package com.lifemate.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final boolean enabled;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username:}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        // Only treat as configured when username looks like a real email address
        // (i.e., not the placeholder "your_gmail@gmail.com")
        this.enabled = fromAddress != null
                && !fromAddress.isBlank()
                && !fromAddress.startsWith("your_");
    }

    public void sendOtp(String to, String otp, String purpose) {
        if (!enabled) {
            log.warn("=== OTP (email disabled) === recipient={} purpose={} code={}", to, purpose, otp);
            return;
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("LifeMate – Your OTP for " + purpose);
            helper.setText(buildEmailBody(otp, purpose), true);
            mailSender.send(msg);
            log.info("OTP email sent to {}", to);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
            log.warn("=== OTP (email failed) === recipient={} purpose={} code={}", to, purpose, otp);
        }
    }

    private String buildEmailBody(String otp, String purpose) {
        return """
                <div style="font-family:Inter,system-ui,sans-serif;background:#050213;color:#E2D9F3;padding:40px;border-radius:16px;max-width:480px;margin:0 auto">
                  <h2 style="background:linear-gradient(135deg,#8B5CF6,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px">LifeMate</h2>
                  <p style="color:#9F8BC7;margin-bottom:24px">Your one-time passcode for <strong style="color:#E2D9F3">%s</strong></p>
                  <div style="background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                    <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#fff">%s</span>
                  </div>
                  <p style="color:#7B6A9A;font-size:13px">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
                  <p style="color:#4A3F6A;font-size:12px;margin-top:16px">If you didn't request this, you can safely ignore this email.</p>
                </div>
                """.formatted(purpose, otp);
    }
}
