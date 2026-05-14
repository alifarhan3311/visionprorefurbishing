import React, { useState, useEffect } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import api from '../../services/api';
import './Blog.css';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/blog');
        if (data.success) setPosts(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="blog-page">
      <Header />
      
      <div className="blog-hero">
        <div className="container">
          <h1 className="reveal">Industry Insights & News</h1>
          <p className="reveal" style={{ transitionDelay: '100ms' }}>Stay updated with the latest in mobile technology and B2B repair strategies.</p>
        </div>
      </div>

      <div className="container blog-grid">
        {loading ? (
          <div className="reveal" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>Loading articles...</div>
        ) : posts.length === 0 ? (
          <div className="reveal" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>No articles published yet.</div>
        ) : (
          posts.map((post, index) => (
            <div className="blog-card reveal" key={post._id} style={{ transitionDelay: `${index * 150}ms` }}>
              <div className="blog-image-wrapper">
                <img src={post.image} alt={post.title} />
                <span className="blog-category">{post.category}</span>
              </div>
              <div className="blog-content">
                <span className="blog-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <button className="read-more-btn">Read Full Article</button>
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
