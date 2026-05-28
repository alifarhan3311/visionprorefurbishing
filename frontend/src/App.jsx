import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardHome from './components/admin/AdminDashboardHome';
import CategoriesManager from './components/admin/Catalog/CategoriesManager';
import CategoryDashboard from './components/admin/Catalog/CategoryDashboard';
import TierCategoryManager from './components/admin/Catalog/TierCategoryManager';
import ProductsManager from './components/admin/Catalog/ProductsManager';
import StockMonitoring from './components/admin/Catalog/StockMonitoring';
import OrderList from './components/admin/Orders/OrderList';
import BuybackTickets from './components/admin/Tickets/BuybackTickets';
import RMATickets from './components/admin/Tickets/RMATickets';
import AppointmentTickets from './components/admin/Tickets/AppointmentTickets';
import CustomersManager from './components/admin/Customers/CustomersManager';
import MarketingManager from './components/admin/Marketing/MarketingManager';
import BlogManager from './components/admin/Marketing/BlogManager';
import HeroSliderManager from './components/admin/Marketing/HeroSliderManager';
import SettingsManager from './components/admin/SettingsManager';
import ReviewsManager from './components/admin/Reviews/ReviewsManager';
import UserLayout from './components/user/UserLayout';
import DashboardHome from './components/user/DashboardHome';
import LCDBuybackForm from './components/user/LCDBuybackForm';
import QuickOrder from './components/user/QuickOrder';
import RMAForm from './components/user/RMAForm';
import MyOrders from './components/user/MyOrders';
import AddressBook from './components/user/AddressBook';
import Appointments from './components/user/Appointments';
import MarketingHub from './components/user/MarketingHub';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Cart from './components/shop/Cart';
import Checkout from './components/shop/Checkout';
import ProductDetails from './components/shop/ProductDetails';
import Contact from './components/shop/Contact';
import Blog from './components/shop/Blog';
import PolicyPage from './components/shop/PolicyPage';
import Support from './components/shop/Support';
import Preloader from './components/common/Preloader';
import Home from './components/home/Home';
import Products from './components/shop/Products';
import './index.css';

// Scroll to top on every route change — placed outside App so it's stable
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};



function App() {
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const observeElements = () => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    };

    observeElements();
    
    // Create a MutationObserver to watch for DOM changes (navigation/loading)
    const mutationObserver = new MutationObserver(observeElements);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <>
      <Preloader />
      <ScrollToTop />
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<><Home /><Footer /></>} />
      <Route path="/products" element={
        <div className="app-container">
          <Header />
          <Products />
          <Footer />
        </div>
      } />
      <Route path="/category/:id" element={<><Home /><Footer /></>} />
      <Route path="/product/:id" element={<><ProductDetails /><Footer /></>} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/support" element={<Support />} />
      <Route path="/faq" element={<Support />} /> {/* Redirecting FAQ to Support which has FAQs */}
      <Route path="/shipping" element={<PolicyPage title="Shipping Policy" content={
        <div>
          <h3>Fast B2B Shipping</h3>
          <p>We provide expedited shipping across Canada. Orders placed before 3 PM EST are shipped the same day.</p>
          <ul>
            <li>Standard (3-5 Days): $150 flat rate</li>
            <li>Expedited (1-2 Days): $25</li>
            <li>Free shipping on orders over $500</li>
          </ul>
        </div>
      } />} />
      <Route path="/terms" element={<PolicyPage title="Terms of Service" content={
        <div>
          <h3>1. B2B Terms</h3>
          <p>By registering for a business account with Vision Pro LCD, you agree to our wholesale terms and bulk purchase conditions.</p>
          <h3>2. Pricing</h3>
          <p>Prices are subject to change without notice based on market fluctuations in the mobile industry.</p>
        </div>
      } />} />
      <Route path="/privacy" element={<PolicyPage title="Privacy Policy" content={
        <div>
          <h3>Data Protection</h3>
          <p>Your business data is secure with us. We do not sell or share your contact information with third-party marketing agencies.</p>
        </div>
      } />} />
      <Route path="/quick-order" element={
        <div className="app-container">
          <Header />
          <div className="container" style={{ padding: '40px 20px' }}>
            <QuickOrder />
          </div>
          <Footer />
        </div>
      } />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Shop Routes */}
      <Route path="/cart" element={
        <div className="app-container">
          <Header />
          <Cart />
          <Footer />
        </div>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute>
          <div className="app-container">
            <Header />
            <Checkout />
          </div>
        </ProtectedRoute>
      } />
      
      {/* User Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="buyback" element={<LCDBuybackForm />} />
        <Route path="rma" element={<RMAForm />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="addresses" element={<AddressBook />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="marketing" element={<MarketingHub />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboardHome />} />
        <Route path="categories" element={<CategoryDashboard />} />
        <Route path="categories/tier1" element={<TierCategoryManager tierLevel={1} />} />
        <Route path="categories/tier2" element={<TierCategoryManager tierLevel={2} />} />
        <Route path="categories/tier3" element={<TierCategoryManager tierLevel={3} />} />
        <Route path="categories/tier4" element={<TierCategoryManager tierLevel={4} />} />
        <Route path="products" element={<ProductsManager />} />
        <Route path="stock-alerts" element={<StockMonitoring />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="buyback" element={<BuybackTickets />} />
        <Route path="rma" element={<RMATickets />} />
        <Route path="appointments" element={<AppointmentTickets />} />
        <Route path="customers" element={<CustomersManager />} />
        <Route path="marketing" element={<MarketingManager />} />
        <Route path="blog" element={<BlogManager />} />
        <Route path="heroslider" element={<HeroSliderManager />} />
        <Route path="settings" element={<SettingsManager />} />
        <Route path="reviews" element={<ReviewsManager />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;
