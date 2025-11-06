import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    api.get(`/api/forum/${id}`).then((response) => {
      setPost(response);
    }).catch((err) => {
      console.error('Error fetching post:', err);
    });
    api.get(`/api/forum/${id}/comments`).then((response) => {
      setComments(response);
    }).catch((err) => {
      console.error('Error fetching comments:', err);
    });
  }, [id]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    api.post(`/api/forum/${id}/comments`, { body: newComment }).then((response) => {
      setComments([response, ...comments]);
      setNewComment('');
    }).catch((err) => {
      console.error('Error posting comment:', err);
    });
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{post.title}</h1>
      <p>By <b>{post.author}</b> on {new Date(post.createdAt).toLocaleDateString()}</p>
      <div style={{ marginTop: '20px', lineHeight: '1.6' }}>{post.body}</div>

      <div style={{ marginTop: '40px' }}>
        <h3>Comments</h3>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ marginTop: '10px', padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
            Submit
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '10px' }}>
              <p><b>{comment.author}</b> on {new Date(comment.createdAt).toLocaleDateString()}</p>
              <p>{comment.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Post;