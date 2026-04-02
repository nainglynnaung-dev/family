import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Heart, MessageCircle, Share2, Mic, Image as ImageIcon, ThumbsUp, Laugh, CircleAlert } from 'lucide-react';
import '../index.css';

export default function Feed({ onLogout }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/posts');
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !newPostMedia) return;
    try {
      await api.post('/api/posts', { content: newPost, mediaUrl: newPostMedia });
      setNewPost('');
      setNewPostMedia(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReact = async (postId, type) => {
    try {
      await api.post(`/api/posts/${postId}/react`, { type });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (postId) => {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    alert('Post link copied to clipboard!');
  };

  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [showReactionMenu, setShowReactionMenu] = useState({});

  const toggleComments = async (postId) => {
    if (!showComments[postId]) {
      try {
        const res = await api.get(`/api/posts/${postId}/comments`);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: res.data } : p));
      } catch (err) {
        console.error(err);
      }
    }
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentSubmit = async (e, postId, voiceUrl = null) => {
    if (e) e.preventDefault();
    const text = commentText[postId];
    if (!text?.trim() && !voiceUrl) return;
    try {
      await api.post(`/api/posts/${postId}/comment`, { content: text, voiceUrl });
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      const res = await api.get(`/api/posts/${postId}/comments`);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: res.data } : p));
    } catch (err) {
      console.error(err);
    }
  };

  // Voice recording state
  const [recordingId, setRecordingId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async (postId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice.wav');
        try {
          const res = await api.post('/api/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (postId === 'new_post') {
            setNewPostMedia(res.data.url);
          } else {
            handleCommentSubmit(null, postId, res.data.url);
          }
        } catch (err) {
          console.err('Upload failed', err);
          alert('Could not upload voice');
        }
        setRecordingId(null);
      };
      mediaRecorder.start();
      setRecordingId(postId);
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleReactionMenu = (postId) => {
    setShowReactionMenu(prev => ({ [postId]: !prev[postId] }));
  };

  const ReactionMenu = ({ postId }) => (
    <div className="glass animate-fade-in" style={{ position: 'absolute', bottom: '100%', left: '0', display: 'flex', gap: '0.8rem', padding: '0.6rem 1rem', borderRadius: '2rem', marginBottom: '0.8rem', background: 'var(--surface)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', zIndex: 100 }}>
      <button onClick={() => { handleReact(postId, 'LIKE'); setShowReactionMenu({}); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', transition: 'transform 0.2s' }} className="reaction-btn" title="Like">👍</button>
      <button onClick={() => { handleReact(postId, 'HEART'); setShowReactionMenu({}); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', transition: 'transform 0.2s' }} className="reaction-btn" title="Heart">❤️</button>
      <button onClick={() => { handleReact(postId, 'HAHA'); setShowReactionMenu({}); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', transition: 'transform 0.2s' }} className="reaction-btn" title="Haha">😆</button>
      <button onClick={() => { handleReact(postId, 'WOW'); setShowReactionMenu({}); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', transition: 'transform 0.2s' }} className="reaction-btn" title="Wow">😮</button>
    </div>
  );

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
          {newPostMedia && (
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>📎 Media attached successfully</p>
              {newPostMedia.includes('/audio/') || newPostMedia.includes('voice') ? <audio src={newPostMedia} controls style={{ width: '100%', height: '30px' }} /> : <img src={newPostMedia} alt="attached" style={{ width: '100%', borderRadius: '0.5rem' }} />}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async (e) => {
                    const file = e.target.files[0];
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await api.post('/api/media/upload', formData);
                    setNewPostMedia(res.data.url);
                  };
                  input.click();
                }}
                className="btn" 
                style={{ background: 'var(--background)', color: 'var(--text-light)' }}
              >
                <ImageIcon size={20} />
              </button>
              <button 
                type="button" 
                onMouseDown={() => startRecording('new_post')}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                className="btn" 
                style={{ background: recordingId === 'new_post' ? 'var(--danger)' : 'var(--background)', color: recordingId === 'new_post' ? 'white' : 'var(--text-light)' }}
              >
                <Mic size={20} />
              </button>
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
              {post.mediaUrl && (
                <div style={{ marginBottom: '1rem' }}>
                  {post.mediaUrl.includes('voice') || post.mediaUrl.includes('/view/') ? <audio src={post.mediaUrl} controls style={{ width: '100%' }} /> : <img src={post.mediaUrl} alt="post media" style={{ width: '100%', borderRadius: '1rem' }} />}
                </div>
              )}
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {showReactionMenu[post.id] && <ReactionMenu postId={post.id} />}
                <button 
                  onClick={() => toggleReactionMenu(post.id)}
                  className="btn" 
                  style={{ background: 'transparent', color: 'var(--text-light)', flex: 1, position: 'relative' }}
                >
                  <Heart size={20} /> <span style={{ marginLeft: '0.5rem' }}>React</span>
                  {post.reactions?.length > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '5px', background: 'var(--primary)', color: 'white', fontSize: '0.7rem', padding: '1px 5px', borderRadius: '1rem' }}>
                      {post.reactions.length}
                    </span>
                  )}
                </button>
                <button onClick={() => toggleComments(post.id)} className="btn" style={{ background: 'transparent', color: 'var(--text-light)', flex: 1 }}>
                  <MessageCircle size={20} /> <span style={{ marginLeft: '0.5rem' }}>Comment</span>
                </button>
                <button onClick={() => handleShare(post.id)} className="btn" style={{ background: 'transparent', color: 'var(--text-light)', flex: 1 }}>
                  <Share2 size={20} /> <span style={{ marginLeft: '0.5rem' }}>Share</span>
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {post.comments?.map(comment => (
                      <div key={comment.id} style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ width: '30px', height: '30px', background: 'var(--secondary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{comment.author.name.charAt(0)}</div>
                        <div style={{ background: 'var(--background)', padding: '0.5rem 1rem', borderRadius: '1rem', flex: 1 }}>
                          <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>{comment.author.name}</p>
                          {comment.content && <p style={{ fontSize: '0.9rem' }}>{comment.content}</p>}
                          {comment.voiceUrl && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <audio src={comment.voiceUrl} controls style={{ height: '30px', width: '100%' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={(e) => handleCommentSubmit(e, post.id)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                      style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid var(--border)', background: 'var(--background)' }}
                    />
                    <button 
                      type="button" 
                      onMouseDown={() => startRecording(post.id)}
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      className="btn" 
                      style={{ background: recordingId === post.id ? 'var(--danger)' : 'var(--background)', color: recordingId === post.id ? 'white' : 'var(--text-light)', padding: '0.5rem' }}
                      title="Hold to record voice"
                    >
                      <Mic size={20} />
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Send</button>
                  </form>
                  {recordingId === post.id && <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.5rem', textAlign: 'right' }}>🔴 Recording...</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
