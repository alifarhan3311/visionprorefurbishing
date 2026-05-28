import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { getImageUrl } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/products');
        if (data.success) {
          setProducts(data.data);
          setTotalPages(Math.ceil(data.data.length / 12));
        }
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const displayedProducts = products.slice((page - 1) * 12, page * 12);

  const getIcon = (productType) => {
    return <Box size={40} strokeWidth={1} />;
  };

  return (
    <div className="container" style={{ padding: '60px 20px', minHeight: '60vh' }}>
      <h1 className="section-title" style={{ marginTop: 0 }}>All Products</h1>
      
      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading products...</p>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'var(--bg-elevated)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
          <Box size={48} style={{ color: 'var(--border-color)', marginBottom: '15px' }} />
          <h3 style={{ color: 'var(--text-primary)' }}>No Products Found</h3>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {displayedProducts.map((product) => (
              <div
                className="product-card reveal active"
                key={product._id}
              >
                {product.badge && (
                  <div className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                    {product.badge}
                  </div>
                )}
                {(product.stockQuantity === 0) && (
                  <div className="card-out-of-stock-ribbon">Out of Stock</div>
                )}
                <Link to={`/product/${product._id}`} className="product-image-container">
                  {product.imageUrl ? (
                    <img src={getImageUrl(product.imageUrl)} alt={product.name} className="product-image" style={{ opacity: product.stockQuantity === 0 ? 0.45 : 1 }} />
                  ) : (
                    getIcon(product.productType)
                  )}
                </Link>
                <div className="product-category">{product.productType}</div>
                <Link to={`/product/${product._id}`} className="product-name">{product.name}</Link>
                <div className="product-price">${product.retailPrice}</div>

                {user?.role === 'admin' ? (
                  <button className="add-to-cart-btn" disabled style={{ opacity: 0.45, cursor: 'not-allowed' }}>
                    Admin View Only
                  </button>
                ) : product.stockQuantity === 0 ? (
                  <button className="add-to-cart-btn out-of-stock-btn" disabled>
                    Out of Stock
                  </button>
                ) : (
                  <button
                    className="add-to-cart-btn"
                    onClick={() => {
                      addToCart(product, 1);
                      navigate('/cart');
                    }}
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === 1}
                style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border-color)', background: page === 1 ? 'var(--bg-elevated)' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => {
                    setPage(pageNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
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
                onClick={() => {
                  setPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === totalPages}
                style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border-color)', background: page === totalPages ? 'var(--bg-elevated)' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
