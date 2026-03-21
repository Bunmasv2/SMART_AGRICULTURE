package com.smartfarm.api.mapper;

import com.smartfarm.api.dto.RoleDto;
import com.smartfarm.api.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {
    public RoleDto toDto(Role entity) {
        if (entity == null) return null;
        return RoleDto.builder()
                .roleId(entity.getRoleId())
                .roleName(entity.getRoleName())
                .build();
    }

    public Role toEntity(RoleDto dto) {
        if (dto == null) return null;
        return Role.builder()
                .roleId(dto.getRoleId())
                .roleName(dto.getRoleName())
                .build();
    }
}
