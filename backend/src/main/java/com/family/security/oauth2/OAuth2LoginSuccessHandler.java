package com.family.security.oauth2;

import com.family.model.User;
import com.family.repository.UserRepository;
import com.family.security.jwt.JwtUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        // If no email from OAuth2, we have a problem. Fallback to name or throw error.
        if (email == null) {
            email = name + "@gmail.com"; // highly risky, but usually google provides email!
        }
        
        // Find existing user or create a new one
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            // OAuth2 users might not have a password, but our DB requires one
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            // user.setAvatarUrl(oAuth2User.getAttribute("picture")); // optional
            userRepository.save(user);
        }
        
        // Generate JWT token
        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());
        
        // Redirect to frontend with token
        String targetUrl = "http://localhost:5173/oauth2/redirect?token=" + jwt;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
