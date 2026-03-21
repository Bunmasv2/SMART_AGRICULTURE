package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.UserDto;
import com.smartfarm.api.entity.Role;
import com.smartfarm.api.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserDto toDto(User entity) {
        if (entity == null) return null;
        UserDto dto = UserDto.builder()
                .userId(entity.getUserId())
                .fullName(entity.getFullName())
                .email(entity.getEmail())
                .build();
        if (entity.getRole() != null) {
            dto.setRoleId(entity.getRole().getRoleId());
            dto.setRoleName(entity.getRole().getRoleName());
        }
        return dto;
    }

    public User toEntity(UserDto dto) {
        if (dto == null) return null;
        User entity = User.builder()
                .userId(dto.getUserId())
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .build();
        if (dto.getRoleId() != null) {
            entity.setRole(Role.builder().roleId(dto.getRoleId()).build());
        }
        return entity;
    }
}
