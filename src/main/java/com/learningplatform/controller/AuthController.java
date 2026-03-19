package com.learningplatform.controller;

import com.learningplatform.config.AppProperties;
import com.learningplatform.domain.AdminUser;
import com.learningplatform.dto.request.LoginRequest;
import com.learningplatform.dto.response.ApiResponse;
import com.learningplatform.dto.response.LoginResponse;
import com.learningplatform.repository.AdminUserRepository;
import com.learningplatform.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and token management")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AdminUserRepository adminUserRepository;
    private final AppProperties appProperties;

    @PostMapping("/login")
    @Operation(summary = "Authenticate and receive a JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        AdminUser adminUser = adminUserRepository.findByUsernameAndActiveTrue(request.getUsername())
                .orElseThrow();

        String token = jwtUtil.generateToken(adminUser.getUsername(), adminUser.getRole().name());

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(appProperties.getSecurity().getJwtExpirationMs())
                .username(adminUser.getUsername())
                .role(adminUser.getRole().name())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }
}
