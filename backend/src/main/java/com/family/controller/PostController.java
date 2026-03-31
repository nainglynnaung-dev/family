package com.family.controller;

import com.family.model.Post;
import com.family.model.User;
import com.family.model.Reaction;
import com.family.model.Comment;
import com.family.repository.PostRepository;
import com.family.repository.UserRepository;
import com.family.repository.ReactionRepository;
import com.family.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private CommentRepository commentRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Post createPost(@RequestBody Map<String, String> payload) {
        Post post = new Post();
        post.setContent(payload.get("content"));
        post.setMediaUrl(payload.get("mediaUrl"));
        post.setAuthor(getCurrentUser());
        return postRepository.save(post);
    }

    @PostMapping("/{id}/react")
    public ResponseEntity<?> reactToPost(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = getCurrentUser();
        String type = payload.get("type");

        Reaction reaction = reactionRepository.findByPostIdAndAuthorId(id, user.getId()).orElse(new Reaction());
        reaction.setPost(post);
        reaction.setAuthor(user);
        reaction.setType(type);
        
        reactionRepository.save(reaction);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/comment")
    public Comment commentOnPost(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = getCurrentUser();

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(user);
        comment.setContent(payload.get("content"));
        comment.setVoiceUrl(payload.get("voiceUrl")); // URL to audio if it's a voice comment
        
        return commentRepository.save(comment);
    }
    
    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(id);
    }
}
