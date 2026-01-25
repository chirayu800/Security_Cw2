import React, { useEffect, useState, useContext } from 'react';
import { getProfileApi, getAllCartItems, updateProfileApi } from '../api/api';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [updating, setUpdating] = useState(false);
  const { getCartCount } = useContext(ShopContext);

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (userId) {
          const res = await getProfileApi(userId);
          setUser(res.data.user);
          
          // Fetch cart items count
          try {
            const cartRes = await getAllCartItems(userId);
            if (cartRes.status === 200) {
              setCartCount(cartRes.data.cart?.length || 0);
            }
          } catch (cartError) {
            console.error('Failed to fetch cart items:', cartError);
            // Fallback to cartData from user object
            const cartData = res.data.user?.cartData || {};
            const totalItems = Object.values(cartData).reduce((sum, sizes) => {
              if (typeof sizes === 'object') {
                return sum + Object.values(sizes).reduce((sizeSum, qty) => sizeSum + (qty || 0), 0);
              }
              return sum + (sizes || 0);
            }, 0);
            setCartCount(totalItems);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({
      name: user?.name || '',
      email: user?.email || ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ name: '', email: '' });
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!editForm.name || !editForm.email) {
      toast.error('Please fill in all fields');
      return;
    }

    setUpdating(true);
    try {
      const res = await updateProfileApi(userId, {
        name: editForm.name,
        email: editForm.email
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Profile updated successfully');
        setUser(res.data.user);
        
        // Update localStorage if email changed
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser._id === userId) {
          storedUser.name = res.data.user.name;
          storedUser.email = res.data.user.email;
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
        
        setIsEditing(false);
      } else {
        toast.error(res.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-500 text-lg">No user data found.</p>
      </div>
    );
  }

  return (
    <div className="pt-16 border-t">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header with Purple Icon */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors"
                onClick={handleEditClick}
                title="Click to edit profile"
              >
                <svg 
                  className="w-7 h-7 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
            </div>
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Information */}
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="pb-4 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="pb-4 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div className="pb-4 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Role
                </label>
                <p className="text-base text-gray-900">{user.isAdmin ? 'Admin' : 'User'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cart Items
                </label>
                <p className="text-base text-gray-900">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={updating}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <p className="text-base text-gray-900">{user.name || 'N/A'}</p>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-base text-gray-900">{user.email || 'N/A'}</p>
              </div>

            <div className="pb-4 border-b border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Role
              </label>
              <p className="text-base text-gray-900">{user.isAdmin ? 'Admin' : 'User'}</p>
            </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cart Items
                </label>
                <p className="text-base text-gray-900">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;