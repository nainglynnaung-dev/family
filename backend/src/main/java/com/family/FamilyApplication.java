package com.family;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.family.model.User;
import com.family.repository.UserRepository;

@SpringBootApplication
public class FamilyApplication {
    public static void main(String[] args) {
        SpringApplication.run(FamilyApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("admin@family.com")) {
                User user = new User();
                user.setName("Family Admin");
                user.setEmail("admin@family.com");
                user.setPassword(passwordEncoder.encode("password123"));
                userRepository.save(user);
                System.out.println("Dummy user created: admin@family.com / password123");
            }
        };
    }
}
