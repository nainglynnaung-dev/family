package com.family.controller;

import com.family.model.Media;
import com.family.repository.MediaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
@CrossOrigin(origins = "*")
public class MediaController {

    @Autowired
    private MediaRepository mediaRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) throws IOException {
        Media media = new Media();
        media.setData(file.getBytes());
        media.setContentType(file.getContentType());
        Media saved = mediaRepository.save(media);
        
        String url = "http://localhost:8080/api/media/view/" + saved.getId();
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<byte[]> view(@PathVariable Long id) {
        Media media = mediaRepository.findById(id).orElseThrow(() -> new RuntimeException("Media not found"));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(media.getContentType()))
                .body(media.getData());
    }
}
