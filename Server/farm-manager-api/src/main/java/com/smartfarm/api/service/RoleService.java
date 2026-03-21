package com.smartfarm.api.service;

import com.smartfarm.api.dto.RoleDto;
import com.smartfarm.api.entity.Role;
import com.smartfarm.api.mapper.RoleMapper;
import com.smartfarm.api.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Autowired
    public RoleService(RoleRepository roleRepository, RoleMapper roleMapper) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
    }

    public List<RoleDto> findAll() {
        return roleRepository.findAll().stream().map(roleMapper::toDto).collect(Collectors.toList());
    }

    public Optional<RoleDto> findById(Long id) {
        return roleRepository.findById(id).map(roleMapper::toDto);
    }

    public RoleDto create(RoleDto dto) {
        Role entity = roleMapper.toEntity(dto);
        return roleMapper.toDto(roleRepository.save(entity));
    }

    public Optional<RoleDto> update(Long id, RoleDto dto) {
        if (!roleRepository.existsById(id)) return Optional.empty();
        Role entity = roleMapper.toEntity(dto);
        entity.setRoleId(id);
        return Optional.of(roleMapper.toDto(roleRepository.save(entity)));
    }

    public boolean deleteById(Long id) {
        if (!roleRepository.existsById(id)) return false;
        roleRepository.deleteById(id);
        return true;
    }
}
