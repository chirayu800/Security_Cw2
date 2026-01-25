import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const Orders = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/user/all", {
        headers: { token },
      });

      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");

      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchProducts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getUserCartItems = (user) => {
    if (!user.cartData || Object.keys(user.cartData).length === 0) {
      return [];
    }

    return Object.entries(user.cartData).map(([productId, quantity]) => {
      const product = products.find((p) => p._id === productId);
      return {
        product,
        quantity,
        productId,
      };
    }).filter((item) => item.product); // Filter out products that don't exist
  };

  const calculateCartTotal = (user) => {
    const cartItems = getUserCartItems(user);
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const removeOrder = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove the cart for ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/cart/clear",
        { userId },
        { 
          headers: { 
            token: token,
            "Content-Type": "application/json"
          } 
        }
      );

      if (response.data.success) {
        toast.success(`Cart cleared for ${userName}`);
        await fetchUsers(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to remove order");
      }
    } catch (error) {
      console.error("Remove order error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to remove order";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-gray-600">Loading orders...</p>
      </div>
    );
  }

  const usersWithCart = users.filter(
    (user) => user.cartData && Object.keys(user.cartData).length > 0
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-gray-800">Orders & Cart Management</h2>
      
      {/* Users Summary */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Users Summary
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Users with Cart</p>
            <p className="text-2xl font-bold text-gray-800">
              {usersWithCart.length}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Total Admin Users</p>
            <p className="text-2xl font-bold text-gray-800">
              {users.filter((u) => u.isAdmin).length}
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {usersWithCart.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-600">No active orders or cart items found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {usersWithCart.map((user) => {
            const cartItems = getUserCartItems(user);
            const total = calculateCartTotal(user);

            return (
              <div
                key={user._id}
                className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex flex-col gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Cart Total</p>
                        <p className="text-xl font-bold text-gray-800">
                          {currency(total)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeOrder(user._id, user.name)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                        title="Remove this order/cart"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove Order
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-2 py-2 text-left">Image</th>
                        <th className="px-2 py-2 text-left">Product</th>
                        <th className="px-2 py-2 text-center">Price</th>
                        <th className="px-2 py-2 text-center">Quantity</th>
                        <th className="px-2 py-2 text-center">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-2 py-3">
                            <img
                              src={item.product.image[0]}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          </td>
                          <td className="px-2 py-3">
                            <p className="font-medium text-gray-800">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.product.category} - {item.product.subCategory}
                            </p>
                          </td>
                          <td className="px-2 py-3 text-center">
                            {currency(item.product.price)}
                          </td>
                          <td className="px-2 py-3 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-2 py-3 text-center font-medium">
                            {currency(item.product.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
