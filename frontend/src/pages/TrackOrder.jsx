import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { getAllCartItems } from '../api/api'
import { toast } from 'react-toastify'

const TrackOrder = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currency } = useContext(ShopContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState(null);

  // Generate tracking number and status based on order
  const generateTrackingInfo = (orderData) => {
    const trackingNumber = `TRK${Date.now().toString().slice(-8)}`;
    const orderDate = new Date();
    const estimatedDelivery = new Date(orderDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 days from order

    // Simulate order status progression
    const statuses = [
      { 
        name: 'Order Placed', 
        completed: true, 
        date: orderDate,
        description: 'Your order has been confirmed'
      },
      { 
        name: 'Processing', 
        completed: true, 
        date: new Date(orderDate.getTime() + 1 * 24 * 60 * 60 * 1000),
        description: 'Your order is being prepared'
      },
      { 
        name: 'Ready for Shipping', 
        completed: true, 
        date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        description: 'Your order is packed and ready'
      },
      { 
        name: 'Shipped', 
        completed: false, 
        date: null,
        description: 'Your order is on the way'
      },
      { 
        name: 'Out for Delivery', 
        completed: false, 
        date: null,
        description: 'Your order will arrive soon'
      },
      { 
        name: 'Delivered', 
        completed: false, 
        date: null,
        description: 'Your order has been delivered'
      }
    ];

    return {
      trackingNumber,
      orderDate,
      estimatedDelivery,
      statuses,
      currentStatus: 'Ready for Shipping',
      carrier: 'Nepal Post',
      carrierTrackingNumber: `NP${Date.now().toString().slice(-10)}`
    };
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const userString = localStorage.getItem('user');
        if (!userString) {
          toast.error('Please login to track orders');
          navigate('/login');
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
        if (response.data.success && response.data.cart.length > 0) {
          // Find the specific order by productId or use first order
          const orderItem = productId 
            ? response.data.cart.find(item => item.product._id === productId)
            : response.data.cart[0];

          if (orderItem) {
            const orderId = location.state?.orderId || `ORD${Date.now().toString().slice(-8)}`;
            const formattedOrder = {
              product: orderItem.product,
              quantity: orderItem.quantity,
              date: new Date().toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              }),
              status: 'Ready for Shipping',
              size: orderItem.size || 'M',
              orderId: orderId
            };
            setOrder(formattedOrder);
            setTrackingInfo(generateTrackingInfo(formattedOrder));
          } else {
            toast.error('Order not found');
            navigate('/orders');
          }
        } else {
          toast.error('No orders found');
          navigate('/orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [productId, navigate]);

  if (loading) {
    return (
      <div className='pt-16 border-t'>
        <div className='text-2xl'>
          <Title text1={'TRACK'} text2={'ORDER'} />
        </div>
        <div className='flex items-center justify-center py-20'>
          <p className='text-gray-600'>Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (!order || !trackingInfo) {
    return (
      <div className='pt-16 border-t'>
        <div className='text-2xl'>
          <Title text1={'TRACK'} text2={'ORDER'} />
        </div>
        <div className='flex items-center justify-center py-20'>
          <p className='text-gray-600'>Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className='pt-16 border-t'>
      <div className='text-2xl mb-8'>
        <Title text1={'TRACK'} text2={'ORDER'} />
      </div>

      {/* Order Summary */}
      <div className='bg-gray-50 rounded-lg p-6 mb-8'>
        <div className='flex flex-col md:flex-row gap-6'>
          <img 
            className='w-32 h-32 object-cover rounded' 
            src={Array.isArray(order.product?.image) ? order.product.image[0] : order.product?.image || 'https://via.placeholder.com/300'} 
            alt={order.product?.name || 'Product'} 
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300';
            }}
          />
          <div className='flex-1'>
            <h3 className='text-xl font-semibold mb-2'>{order.product?.name || 'Product'}</h3>
            <div className='flex flex-wrap gap-4 text-sm text-gray-600 mb-4'>
              <p><span className='font-medium'>Order ID:</span> {order.orderId}</p>
              <p><span className='font-medium'>Tracking Number:</span> {trackingInfo.trackingNumber}</p>
              <p><span className='font-medium'>Quantity:</span> {order.quantity}</p>
              <p><span className='font-medium'>Size:</span> {order.size}</p>
            </div>
            <p className='text-lg font-semibold'>
              {currency}&nbsp;
              {order.product?.price?.toLocaleString('en-NP', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              }) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className='bg-white rounded-lg border border-gray-200 p-6 mb-8'>
        <h3 className='text-xl font-semibold mb-6'>Order Status</h3>
        <div className='relative'>
          {/* Timeline Line */}
          <div className='absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200'></div>
          
          {/* Status Steps */}
          <div className='space-y-8'>
            {trackingInfo.statuses.map((status, index) => (
              <div key={index} className='relative flex items-start gap-4'>
                {/* Status Icon */}
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                  status.completed 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}>
                  {status.completed ? (
                    <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                  ) : (
                    <div className='w-3 h-3 bg-white rounded-full'></div>
                  )}
                </div>
                
                {/* Status Content */}
                <div className='flex-1 pt-1'>
                  <div className='flex items-center justify-between mb-1'>
                    <h4 className={`font-semibold ${
                      status.completed ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {status.name}
                    </h4>
                    {status.date && (
                      <span className='text-sm text-gray-500'>
                        {status.date.toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    status.completed ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {status.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className='bg-white rounded-lg border border-gray-200 p-6 mb-8'>
        <h3 className='text-xl font-semibold mb-4'>Shipping Information</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='text-gray-500 mb-1'>Carrier</p>
            <p className='font-medium'>{trackingInfo.carrier}</p>
          </div>
          <div>
            <p className='text-gray-500 mb-1'>Carrier Tracking Number</p>
            <p className='font-medium'>{trackingInfo.carrierTrackingNumber}</p>
          </div>
          <div>
            <p className='text-gray-500 mb-1'>Order Date</p>
            <p className='font-medium'>
              {trackingInfo.orderDate.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className='text-gray-500 mb-1'>Estimated Delivery</p>
            <p className='font-medium text-green-600'>
              {trackingInfo.estimatedDelivery.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-4'>
        <button
          onClick={() => navigate('/orders')}
          className='px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition'
        >
          Back to Orders
        </button>
        <button
          onClick={() => window.print()}
          className='px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition'
        >
          Print Tracking
        </button>
      </div>
    </div>
  )
}

export default TrackOrder

