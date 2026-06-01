import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api, { getImageUrl } from '../../services/api';
import Header from '../layout/Header';

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        // Fetch products for this category
        const productsRes = await api.get(`/products?category=${slug}`);
        if (productsRes.data.success) {
          setProducts(productsRes.data.data || []);
          // Use slug as category name, formatted with capital letters
          const formattedName = slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          setCategoryName(formattedName);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [slug]);

  const productTypes = ['all', ...Array.from(new Set(products.map(p => p.productType).filter(Boolean)))];
  
  const filteredProducts = filterType === 'all' 
    ? products 
    : products.filter(p => (p.productType || '').toLowerCase() === filterType.toLowerCase());

  useEffect(() => {
    setPage(1);
  }, [slug, filterType]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / 12));
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const displayedProducts = filteredProducts.slice((page - 1) * 12, page * 12);

  return (
    <>
      <Header />
      <div className="products-page-wrapper">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb-nav" style={{ marginBottom: '40px', marginTop: '30px' }}>
            <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={16} style={{ margin: '0 8px', color: '#94a3b8' }} />
            <span style={{ color: '#64748b' }}>{categoryName}</span>
          </div>

          {/* Category Header */}
          <div style={{ marginBottom: '50px' }}>
            <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>
              {categoryName}
            </h1>
            <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '30px' }}>
              Browse all products in this category
            </p>

            {/* Filter Chips */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {productTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: filterType === type ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    backgroundColor: filterType === type ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                    color: filterType === type ? 'var(--primary-color)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <p style={{ fontSize: '16px' }}>Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>No products found in this category.</p>
              <Link to="/products" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '700' }}>
                Browse All Products →
              </Link>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {displayedProducts.map(product => (
                  <div key={product._id} className="product-card">
                    {product.badge && (
                      <span className={`product-badge ${product.badge.toLowerCase().replace(/\s+/g, '-')}`}>
                        {product.badge}
                      </span>
                    )}
                    <div className="product-image-container">
                      {product.imageUrl ? (
                        <img src={getImageUrl(product.imageUrl)} alt={product.name} className="product-image" />
                      ) : (
                        <div style={{ fontSize: '48px' }}>📦</div>
                      )}
                    </div>
                    <div className="product-category">{product.category?.name || 'Uncategorized'}</div>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">${parseFloat(product.retailPrice || 0).toFixed(2)}</div>
                    <Link to={`/product/${product._id}`} className="add-to-cart-btn">
                      View Details
                    </Link>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: page === 1 ? 'var(--bg-elevated)' : 'white',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: pageNum === page ? 'none' : '1px solid var(--border-color)',
                      background: pageNum === page ? 'var(--primary-color)' : 'white',
                      color: pageNum === page ? 'white' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: pageNum === page ? 'bold' : 'normal'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: page === totalPages ? 'var(--bg-elevated)' : 'white',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
