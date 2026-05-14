# VisionPro B2B Refurbishing Platform - Comprehensive Documentation

## 1. Project Overview
The VisionPro Platform is an enterprise-grade B2B e-commerce and service management system designed exclusively for mobile repair shops, dealers, and refurbishers. Built on the MERN stack (MongoDB, Express, React, Node.js), it provides a premium portal for purchasing OEM-grade repair parts, managing LCD buybacks, requesting RMAs (Return Merchandise Authorizations), and booking specialized repair appointments.

---

## 2. Architecture & Tech Stack
* **Frontend**: React.js, Vite, React Router DOM, Context API (Cart & Auth), Lucide React (Icons), Vanilla CSS (Enterprise Glassmorphism UI).
* **Backend**: Node.js, Express.js, JWT Authentication, RESTful APIs.
* **Database**: MongoDB (Mongoose ORM).
* **Infrastructure**: Role-Based Access Control (RBAC) supporting `admin` and `user` (dealer) roles.

---

## 3. Application Flow & Portals

The application is logically divided into three primary portals:

### A. The Public Frontend (Shop & Catalog)
This is the unauthenticated and authenticated storefront where B2B clients browse products and make purchases.

* **Main Header & Navigation**: Features a responsive top bar with contact info, a main header with an intelligent search bar, a dynamic cart badge, and a 4-tier Mega Menu for deep category navigation.
* **Home Page**: Displays a dynamic hero slider, promotional banners, and a grid of the latest inventory items fetched directly from the backend. 
* **Product Details Page (PDP)**: 
  * Displays high-resolution product images, pricing (Retail vs. B2B Tiered Pricing), and bulk savings tables.
  * Interactive Tabs: Specifications, Warranty Information, and Compatible Models.
  * Direct "Add to Cart" functionality with modern toast notifications.
* **Shopping Cart & Checkout**: 
  * Calculates subtotal dynamically. Protects the checkout route so only registered and logged-in B2B dealers can proceed to final payment/order submission.
* **Resource Pages**: Public access to Blog, Support/FAQ, Contact Forms, and Legal Policies (Shipping, Terms, Privacy).

### B. The B2B User Dashboard (`/dashboard`)
Accessible only to logged-in users (dealers/clients). This acts as their central hub for interacting with the VisionPro business.

* **Dashboard Home**: Provides an at-a-glance summary of active orders, pending RMAs, and account status.
* **LCD Buyback (`/dashboard/buyback`)**: A specialized form where dealers can submit broken LCD screens for credit. They define screen conditions (Grade A, B, C) and submit requests to the admin queue.
* **RMA Form (`/dashboard/rma`)**: A streamlined system to request returns/replacements for defective parts purchased previously.
* **Appointments (`/dashboard/appointments`)**: Allows clients to book in-person or mail-in repair slots for advanced motherboard/microsoldering services.
* **My Orders**: A ledger of all past and current purchases with status tracking.
* **Marketing Hub**: A repository where dealers can download VisionPro-branded marketing assets (banners, flyers) for their own retail shops.

### C. The Enterprise Admin Portal (`/admin`)
Accessible strictly by users with `isAdmin: true`. It features a dark-themed, glassmorphic sidebar and comprehensive data grids.

* **Catalog Management**:
  * **Categories Manager**: Create and organize the hierarchical taxonomy (Parent > Child categories) for the Mega Menu.
  * **Products Manager**: Full CRUD capabilities for inventory. Admins can define pricing (Retail, Base, B2B), stock counts, compatible models, and warranty specs.
  * **Stock Monitoring**: A real-time surveillance dashboard that flags low-stock (Critical) and out-of-stock (Depleted) items using visual health bars.
* **Service & Ticket Queues**:
  * **Order List**: Manage customer orders, update fulfillment statuses (Processing, Shipped, Delivered), and track payments.
  * **Appointment Tickets**: A Kanban/List view to approve, reschedule, or complete repair appointments requested by users.
  * **RMA Tickets**: Processing center for approving or rejecting return requests and issuing credits.
  * **Buyback Tickets**: Grading and approving LCD buyback requests. Admin can adjust payouts based on the actual received condition of the screens.
* **Customer Relationship Management (CRM)**:
  * **Customers Manager**: View all registered B2B dealers, approve new wholesale accounts, and monitor their purchase history.
* **Marketing & Content**:
  * **Blog Manager**: An editorial interface to publish, edit, and delete SEO-friendly news and repair guides.
  * **Marketing Assets**: Upload promotional materials for dealers to access.
* **Global Settings**:
  * Manage platform configurations such as Support Email, Phone Number, Global Shipping Rates, and Maintenance Mode toggles.

---

## 4. Key Workflows & Features

#### 1. Authentication & Role Routing
When a user logs in via `/login`, the backend issues a JWT token. The `AuthContext` decodes the user's role. 
* If `role === 'admin'`, they are granted access to `/admin/*`. 
* If `role === 'user'`, they are restricted to `/dashboard/*` and standard shopping routes. 
Unauthorized access to protected routes forcefully redirects to the login screen.

#### 2. Cart & Order Flow
1. User adds items to the cart (stored in LocalStorage via `CartContext`).
2. User proceeds to Checkout (must be authenticated).
3. The order is submitted to the backend and saved in the `Order` collection.
4. The cart is cleared.
5. The Admin sees the order in the `Order List` and updates the status from `Pending` -> `Shipped`.

#### 3. Service Ticket Lifecycle (RMA / Buyback)
1. **Submission**: User fills out a form in their dashboard. The data is saved to the `RMA` or `Buyback` MongoDB collection with a status of `Pending`.
2. **Review**: Admin opens the respective Ticket Queue in the Admin Portal.
3. **Action**: Admin reviews the notes/images and updates the status to `Approved`, `Rejected`, or `Completed`. 
4. **Resolution**: The user's dashboard reflects the updated status immediately.

#### 4. B2B Tiered Pricing Logic
Products have multiple price points: `retailPrice` (MSRP) and `baseRetailPrice` (B2B baseline). The Product Details Page dynamically calculates 10% and 20% discounts for bulk purchases (e.g., 10+ units or 50+ units) to incentivize wholesale buying.

---

## 5. Security & Stability
* **JWT Authentication**: All API requests to protected routes (`/api/admin/*` or `/api/user/*`) must include a Bearer token.
* **Graceful Degradation**: Frontend components (like the Cart) use fallback UI and default values (`item.price || 0`) to prevent React rendering crashes if data is malformed.
* **Environment Variables**: Sensitive data (MongoDB URI, JWT Secret, Port) are secured in the `.env` file and ignored by Git.
