package com.family.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "reactions")
@Data
public class Reaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User author;
    
    private String type; // e.g. LIKE, LOVE, HAHA, WOW, SAD, ANGRY
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
