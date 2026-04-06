package com.smartfarm.api.controller;

import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.dto.UserDto;
import com.smartfarm.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAll() {
        try {
            return ResponseEntity.ok(ApiResponse.success(userService.findAll()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getById(@PathVariable Integer id) {
        return userService.findById(id)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("User not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> create(@RequestBody UserDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(userService.create(dto), "User created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> update(@PathVariable Integer id, @RequestBody UserDto dto) {
        try {
            return userService.update(id, dto)
                    .map(data -> ResponseEntity.ok(ApiResponse.success(data, "User updated successfully")))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.notFound("User not found with id: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        try {
            if (userService.deleteById(id)) {
                return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound("User not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserDto>> updateRole(
            @PathVariable Integer id,
            @RequestParam Integer roleId,
            @RequestHeader(value = "X-Role-Id", required = false) Integer currentRoleId) {
        if (currentRoleId != null && currentRoleId > 2) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(403, "Chỉ Admin mới có quyền đổi role"));
        }
        try {
            return userService.updateRole(id, roleId)
                    .map(data -> ResponseEntity.ok(ApiResponse.success(data, "Role updated successfully")))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.notFound("User not found with id: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }
}
