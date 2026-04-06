package com.smartfarm.api.controller;

import com.smartfarm.api.dto.*;
import com.smartfarm.api.entity.User;
import com.smartfarm.api.repository.UserRepository;
import com.smartfarm.api.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthController(UserRepository userRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, "Email đã tồn tại"));
        }

        String verificationCode = String.format("%06d", new Random().nextInt(999999));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .verificationCode(verificationCode)
                .isVerified(false)
                .build();

        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationCode);
            return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công, vui lòng kiểm tra email để lấy mã xác nhận"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Lỗi gửi mail: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<String>> verify(@Valid @RequestBody VerifyRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
                    if (user.getVerificationCode().equals(request.getCode())) {
                        user.setVerified(true);
                        user.setVerificationCode(null);
                        userRepository.save(user);
                        return ResponseEntity.ok(ApiResponse.success("Xác thực thành công, bạn có thể đăng nhập ngay bây giờ"));
                    }
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(ApiResponse.<String>error(400, "Mã xác nhận không chính xác"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "Không tìm thấy người dùng")));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto>> login(@Valid @RequestBody LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
                    if (!user.isVerified()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.<UserDto>error(403, "Tài khoản chưa được xác thực email"));
                    }
                    if (passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                        // In a real app, generate JWT here. For simplicity, we return UserDto.
                        UserDto dto = UserDto.builder()
                                .userId(user.getUserId())
                                .fullName(user.getFullName())
                                .email(user.getEmail())
                                .roleId(user.getRole() != null ? user.getRole().getRoleId() : null)
                                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                                .build();
                        return ResponseEntity.ok(ApiResponse.success(dto, "Đăng nhập thành công"));
                    }
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(ApiResponse.<UserDto>error(401, "Mật khẩu không chính xác"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "Không tìm thấy người dùng")));
    }
}
