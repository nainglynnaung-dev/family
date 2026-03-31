package com.family.repository;

import com.family.model.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    Optional<Reaction> findByPostIdAndAuthorId(Long postId, Long authorId);
}
