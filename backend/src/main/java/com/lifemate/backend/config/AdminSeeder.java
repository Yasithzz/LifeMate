package com.lifemate.backend.config;

import com.lifemate.backend.model.Role;
import com.lifemate.backend.model.User;
import com.lifemate.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminSeeder(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        @Value("${app.admin.email}") String adminEmail,
                        @Value("${app.admin.password}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        try {
            String targetEmail = adminEmail.trim().toLowerCase();
            java.util.List<User> admins = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .toList();

            if (admins.isEmpty()) {
                // No admin exists — create one
                User admin = new User();
                admin.setFullName("Admin");
                admin.setEmail(targetEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
                log.info("Seeded super admin account: {}", targetEmail);
            } else {
                User existing = admins.get(0);
                if (!existing.getEmail().equals(targetEmail)) {
                    // Config email changed — update the admin's login email
                    existing.setEmail(targetEmail);
                    userRepository.save(existing);
                    log.info("Admin email updated to: {}", targetEmail);
                } else {
                    log.info("Admin account already exists: {}", existing.getEmail());
                }
            }
        } catch (Exception ex) {
            log.warn("AdminSeeder skipped — DB not yet available ({}). Will retry on next restart.", ex.getMessage());
        }
    }
}
