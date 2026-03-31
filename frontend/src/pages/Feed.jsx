import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, Share2, Mic, Image as ImageIcon } from 'lucide-react';
import '../index.css';

export default function Feed({ onLogout }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  // Example token reading (usually from a hook or context)
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/posts', { headers });
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout();
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      await axios.post('http://localhost:8080/api/posts', { content: newPost }, { headers });
      setNewPost('');
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReact = async (postId, type = 'LIKE') => {
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/react`, { type }, { headers });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem', background: 'var(--surface)', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Family App</h1>
        <button onClick={onLogout} className="btn" style={{ background: 'var(--border)' }}>Log Out</button>
      </header>

      {/* Create Post */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', background: 'var(--surface)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handlePostSubmit}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            style={{ width: '100%', border: 'none', background: 'var(--background)', padding: '1rem', borderRadius: '0.5rem', resize: 'none', marginBottom: '1rem', fontSize: '1rem' }}
            placeholder="What's on your mind?"
            rows={3}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn" style={{ background: 'var(--background)', color: 'var(--text-light)' }}><ImageIcon size={20} /></button>
              <button type="button" className="btn" style={{ background: 'var(--background)', color: 'var(--text-light)' }}><Mic size={20} /></button>
            </div>
            <button type="submit" className="btn btn-primary">Post</button>
          </div>
        </form>
      </div>

      {/* Feed List */}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading feed...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.map(post => (
            <div key={post.id} className="animate-fade-in" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {post.author ? post.author.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 style={{ fontWeight: '600' }}>{post.author ? post.author.name : 'Unknown User'}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <p style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>{post.content}</p>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => handleReact(post.id, 'HEART')} className="btn" style={{ background: 'transparent', color: 'var(--text-light)', flex: 1 }}>
                  <Heart size={20} /> <span style={{ marginLeft: '0.5rem' }}>React</span>
                </button>
                <button className="btn" style={{ background: 'transparent', color: 'var(--text-light)', flex: 1 }}>
                  <MessageCircle size={20} /> <span style={{ marginLeft: '0.5rem' }}>Comment</span>
                </button>
                <button className="btn" style={{ background: 'transparent', color: 'var(--text-light)', flex: 1 }}>
                  <Share2 size={20} /> <span style={{ marginLeft: '0.5rem' }}>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
