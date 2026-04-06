package com.smartfarm.api.repository;

import com.smartfarm.api.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    @EntityGraph(attributePaths = {"role"})
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}