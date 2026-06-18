package com.lifemate.backend.repository;

import com.lifemate.backend.model.Role;
import com.lifemate.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRole(Role role);
}
