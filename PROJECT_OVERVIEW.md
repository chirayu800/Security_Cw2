# 🛒 MERN E-Commerce Project - Key Entities & Features

## 📊 **Key Database Entities (Models)**

### 1. **User Model** (`userModel.js`)
- **Fields**: `name`, `email`, `password`, `cartData`, `isAdmin`, `resetPasswordToken`, `resetPasswordExpires`
- **Purpose**: Manages user accounts, authentication, cart persistence, and password reset functionality
- **Features**: 
  - User registration and login
  - Cart data stored per user
  - Password reset with token expiration
  - Admin role support

### 2. **Product Model** (`productModel.js`)
- **Fields**: `name`, `description`, `price`, `image` (array), `category`, `subCategory`, `sizes` (array), `bestSeller`, `date`
- **Purpose**: Stores product catalog information
- **Features**:
  - Multiple product images
  - Category and sub-category organization
  - Size variants
  - Best seller flagging
  - Timestamp tracking

### 3. **Contact Model** (`contactModel.js`)
- **Fields**: `name`, `email`, `subject`, `message`, `status` (new/read/replied), `timestamps`
- **Purpose**: Manages customer contact form submissions
- **Features**:
  - Status tracking (new, read, replied)
  - Automatic timestamp creation
  - Admin management interface

### 4. **Newsletter Model** (`newsletterModel.js`)
- **Fields**: `email`, `subscribedAt`, `isActive`, `timestamps`
- **Purpose**: Tracks newsletter subscribers
- **Features**:
  - Unique email validation
  - Subscription date tracking
  - Active/inactive status management
  - Auto-lowercase and trim email

### 5. **Admin Settings Model** (`adminSettingsModel.js`)
- **Fields**: `email`, `password`, `timestamps`
- **Purpose**: Manages admin authentication credentials
- **Features**:
  - Secure admin login
  - Password change functionality
  - JWT token-based authentication

---

## 🎯 **Core Features**

### **Frontend Features (User-Facing)**

#### 1. **Authentication System**
- User registration and login
- Password reset via email (Forgot Password flow)
- Profile management with edit functionality
- JWT-based session management
- Protected routes

#### 2. **Product Browsing & Discovery**
- **Home Page**: Hero section, category sections (Men/Women/Kids), latest collection, best sellers
- **Collection Page**: 
  - Dynamic search functionality
  - Category filtering (Men, Women, Kids)
  - Sub-category filtering
  - Search by product name/description
  - Scroll-triggered animations
- **Product Detail Page**: Full product information, image gallery, size selection, related products

#### 3. **Shopping Cart System**
- Add/remove products
- Quantity management
- Size-based cart items
- Local storage persistence
- Real-time cart count badge
- Cart total calculation with delivery fees

#### 4. **Favorites/Wishlist**
- Add/remove favorite products
- Heart icon with count badge in navigation
- Dedicated Favorites page
- Local storage persistence
- Visual favorite indicators on products

#### 5. **Order Management**
- **Place Order Page**: 
  - Delivery information form
  - Payment method selection (eSewa, Khalti, Cash on Delivery)
  - Brand-accurate payment logos
  - Form validation
- **Orders Page**: 
  - View all past orders
  - Order details (product, quantity, size, date, status)
  - Track order button
- **Track Order Page**: 
  - 6-stage order timeline (Order Placed → Processing → Ready for Shipping → Shipped → Out for Delivery → Delivered)
  - Order summary
  - Shipping information
  - Tracking number generation
  - Print tracking functionality

#### 6. **User Profile**
- View user information
- Edit profile functionality
- Purple user icon design
- Profile update API integration

#### 7. **Contact & Communication**
- Contact form with animations
- Newsletter subscription
- Form validation
- Success/error notifications

#### 8. **UI/UX Enhancements**
- Scroll-triggered animations (Intersection Observer)
- Responsive design (mobile, tablet, desktop)
- Loading states
- Empty states with helpful messages
- Toast notifications
- Search bar with dynamic results
- Category sections with uniform image sizing

---

### **Admin Panel Features**

#### 1. **Dashboard**
- Statistics overview
- Total subscribers count
- Active subscribers count
- Contact messages statistics (total, new, read, replied)
- Real-time data fetching

#### 2. **Product Management**
- **Add Products**: 
  - Product name, description, price
  - Multiple image upload (Cloudinary integration)
  - Category and sub-category selection
  - Size selection (multiple sizes)
  - Best seller flag
- **List Products**: 
  - View all products in table format
  - Edit product details
  - Delete products
  - Search functionality

#### 3. **Order Management**
- View all customer orders
- Order status tracking
- Order details management

#### 4. **Subscriber Management**
- View all newsletter subscribers
- Search subscribers
- Remove/unsubscribe functionality
- Active/inactive status display

#### 5. **Contact Management**
- View all contact form submissions
- Search contacts
- Filter by status (new, read, replied)
- Update message status
- View detailed messages
- Delete contacts

#### 6. **Admin Settings**
- Admin login with JWT authentication
- Change admin password
- Forgot password link
- Show/hide password toggles
- Secure token management

---

## 🔧 **Technical Stack**

### **Frontend**
- **React.js** with React Router DOM
- **Tailwind CSS** for styling
- **React Context API** for global state management
- **Axios** for API calls
- **React Toastify** for notifications
- **Local Storage** for client-side persistence

### **Backend**
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for image storage
- **Bcrypt** for password hashing

### **Key Libraries & Tools**
- **Intersection Observer API** for scroll animations
- **React Router** for navigation
- **Vite** as build tool
- **ESLint** for code quality

---

## 🔐 **Security Features**

1. **JWT Authentication**: Secure token-based authentication for users and admins
2. **Password Hashing**: Bcrypt for secure password storage
3. **Admin Middleware**: Protected admin routes with `adminAuth` middleware
4. **Token Expiration**: 7-day token expiration for admin sessions
5. **Input Validation**: Form validation on frontend and backend
6. **CORS Configuration**: Secure cross-origin resource sharing

---

## 📱 **Responsive Design**

- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:` for different screen sizes
- Flexible grid layouts
- Responsive navigation (mobile menu)
- Touch-friendly buttons and inputs

---

## 🎨 **UI Components**

### **Reusable Components**
- `NavBar`: Navigation with cart, favorites, search, user profile
- `Footer`: Site footer with company info, links, FAQ
- `ProductItem`: Product card with image, name, price, favorite button
- `SearchBar`: Dynamic search with results dropdown
- `Hero`: Hero section with call-to-action
- `CategorySection`: Category cards (Men, Women, Kids)
- `LatestCollection`: Latest products showcase
- `BestSeller`: Best seller products grid
- `OurPolicy`: Policy information cards
- `NewsLetterBox`: Newsletter subscription form
- `CartTotal`: Cart summary and checkout button
- `Title`: Section title component

---

## 🚀 **Key Functionalities**

1. **Dynamic Search**: Real-time product search across name, description, category
2. **Cart Persistence**: Cart items saved in localStorage and user database
3. **Favorite System**: Client-side favorites with localStorage persistence
4. **Order Tracking**: Multi-stage order status with visual timeline
5. **Image Management**: Cloudinary integration for product images
6. **Form Handling**: Contact form, newsletter, checkout forms
7. **Admin CRUD**: Full Create, Read, Update, Delete for products, orders, contacts, subscribers
8. **Status Management**: Order status, contact status, subscriber status tracking
9. **Animations**: Scroll-triggered fade-in, slide-in animations
10. **Error Handling**: Comprehensive error handling with user-friendly messages

---

## 📈 **Data Flow**

1. **Product Flow**: Admin adds → Backend stores → Frontend fetches → User browses → Adds to cart
2. **Order Flow**: User adds to cart → Places order → Admin views → Updates status → User tracks
3. **Contact Flow**: User submits → Backend stores → Admin views → Updates status → Responds
4. **Newsletter Flow**: User subscribes → Backend stores → Admin manages → Email campaigns

---

## 🎯 **Future Enhancement Opportunities**

- Payment gateway integration (eSewa, Khalti actual implementation)
- Email notifications for orders
- Product reviews and ratings
- Advanced filtering (price range, color, brand)
- User dashboard with order history
- Inventory management
- Discount/coupon system
- Multi-language support
- Analytics and reporting

