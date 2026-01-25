import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { getAllCartItems } from '../api/api'
import { toast } from 'react-toastify'

const Orders = () => {
  const { currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userString = localStorage.getItem('user');
        if (!userString) {
          toast.error('Please login to view orders');
          setLoading(false);
          return;
        }

        const user = JSON.parse(userString);
        const userId = user._id;

        if (!userId) {
          toast.error('User ID not found');
          setLoading(false);
          return;
        }

        const response = await getAllCartItems(userId);
        if (response.data.success) {
          // Format cart items as orders
          const formattedOrders = response.data.cart.map((item, index) => ({
            product: item.product,
            quantity: item.quantity,
            date: new Date().toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }),
            status: 'Ready for Shipping',
            size: item.size || 'M', // Default size if not available
            orderId: `ORD${Date.now().toString().slice(-8)}${index}` // Unique order ID
          }));
          setOrders(formattedOrders);
        } else {
          toast.error('Failed to load orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className='pt-16 border-t'>
        <div className='text-2xl'>
          <Title text1={'YOUR'} text2={'ORDERS'} />
        </div>
        <div className='flex items-center justify-center py-20'>
          <p className='text-gray-600'>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className='pt-16 border-t'>
        <div className='text-2xl'>
          <Title text1={'YOUR'} text2={'ORDERS'} />
        </div>
        <div className='flex items-center justify-center py-20'>
          <p className='text-gray-600'>No orders found</p>
        </div>
      </div>
    );
  }

  return (
    <div className='pt-16 border-t'>
      <div className='text-2xl'>
        <Title text1={'YOUR'} text2={'ORDERS'} />
      </div>
      <div>
        {orders.map((order, index) => (
          <div key={index} className='flex flex-col gap-4 py-4 text-gray-700 border-t border-b md:flex-row md:items-center md:justify-between'>
            <div className='flex items-start gap-6 text-sm'>
              <img 
                className='w-16 sm:w-20 object-cover' 
                src={Array.isArray(order.product?.image) ? order.product.image[0] : order.product?.image || 'https://via.placeholder.com/300'} 
                alt={order.product?.name || 'Product'} 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300';
                }}
              />
              <div>
                <p className='font-medium sm:text-base'>{order.product?.name || 'Product'}</p>
                <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                  <p className='text-lg'>
                    {currency}&nbsp;
                    {order.product?.price?.toLocaleString('en-NP', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    }) || '0.00'}
                  </p>
                  <p>Quantity:&nbsp;{order.quantity}</p>
                  <p>Size:&nbsp;{order.size}</p>
                </div>
                <p className='mt-2'>
                  Date:&nbsp;
                  <span className='text-gray-400'>{order.date}</span>
                </p>
              </div>
            </div>
            <div className='flex justify-between md:w-1/2'>
              <div className='flex items-center gap-2'>
                <p className='h-2 bg-green-500 rounded-full min-w-2'></p>
                <p className='text-sm md:text-base'>{order.status}</p>
              </div>
              <button 
                onClick={() => navigate(`/track-order/${order.product?._id || index}`, { state: { orderId: order.orderId } })}
                className='px-4 py-2 text-sm font-medium border rounded-sm hover:bg-gray-100 transition'
              >
                TRACK ORDER
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
