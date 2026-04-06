package com.smartfarm.api.service;

import com.smartfarm.api.dto.UserDto;
import com.smartfarm.api.entity.Role;
import com.smartfarm.api.entity.User;
import com.smartfarm.api.mapper.UserMapper;
import com.smartfarm.api.repository.RoleRepository;
import com.smartfarm.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
    }

    public List<UserDto> findAll() {
        return userRepository.findAll().stream().map(userMapper::toDto).collect(Collectors.toList());
    }

    public Optional<UserDto> findById(Integer id) {
        return userRepository.findById(id).map(userMapper::toDto);
    }

    public UserDto create(UserDto dto) {
        User entity = userMapper.toEntity(dto);
        return userMapper.toDto(userRepository.save(entity));
    }

    public Optional<UserDto> update(Integer id, UserDto dto) {
        if (!userRepository.existsById(id))
            return Optional.empty();
        User entity = userMapper.toEntity(dto);
        entity.setUserId(id);
        return Optional.of(userMapper.toDto(userRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!userRepository.existsById(id))
            return false;
        userRepository.deleteById(id);
        return true;
    }

    public Optional<UserDto> updateRole(Integer id, Integer roleId) {
        return userRepository.findById(id).map(user -> {
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
            user.setRole(role);
            return userMapper.toDto(userRepository.save(user));
        });
    }
}