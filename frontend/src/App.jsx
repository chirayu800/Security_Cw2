import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import TrackOrder from './pages/TrackOrder'
import Favorites from './pages/Favorites'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer position='bottom-right' />
      <NavBar />
      <SearchBar />
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        {/* Protected Routes - User Role Required */}
        <Route path='/profile' element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path='/cart' element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path='/place-order' element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
            <PlaceOrder />
          </ProtectedRoute>
        } />
        <Route path='/orders' element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path='/track-order/:productId?' element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
            <TrackOrder />
          </ProtectedRoute>
        } />
        <Route path='/favorites' element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
            <Favorites />
          </ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </div>
  )
}

export default App