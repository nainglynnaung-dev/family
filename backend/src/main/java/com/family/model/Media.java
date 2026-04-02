package com.family.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "media")
@Data
public class Media {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Lob
    private byte[] data;
    
    private String contentType;
}
