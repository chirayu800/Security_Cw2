// import React, { useContext, useState } from 'react'
// import Title from '../components/Title'
// import CartTotal from '../components/CartTotal'
// import { assets } from '../assets/assets'
// import { ShopContext } from '../context/ShopContext'

// const PlaceOrder = () => {

//   const [method, setMethod] = useState('cod');
//   const {navigate} = useContext(ShopContext);
  
//   return (
//     <div className='flex flex-col justify-between gap-4 pt-5 sm:flex-row sm:pt-14 min-h-[80vh] border-t'>
//       {/* Left Side Content */}
//       <div className='flex flex-col w-full gap-4 sm:max-w-[480px]'>
//         <div className='my-3 text-xl sm:text-2xl'>
//           <Title text1={'DELIVERY'} text2={'INFORMATION'} />
//         </div>
//         <div className='flex gap-3'>
//           <input 
//             className='w-full px-4 py-2 border border-gray-300 rounded' 
//             type="text" 
//             placeholder='First Name' 
//           />
//           <input 
//             className='w-full px-4 py-2 border border-gray-300 rounded' 
//             type="text" 
//             placeholder='Last Name' 
//           />
//         </div>
//         <input 
//           className='w-full px-4 py-2 border border-gray-300 rounded' 
//           type="email" 
//           placeholder='Email Address' 
//         />
//         <input 
//           className='w-full px-4 py-2 border border-gray-300 rounded' 
//           type="text" 
//           placeholder='Street' 
//         />
//         <div className='flex gap-3'>
//           <input 
//             className='w-full px-4 py-2 border border-gray-300 rounded' 
//             type="text" 
//             placeholder='City' 
//           />
//           <input 
//             className='w-full px-4 py-2 border border-gray-300 rounded' 
//             type="text" 
//             placeholder='State' 
//           />
//         </div>
//         <div className='flex gap-3'>
//           <input 
//             className='w-full px-4 py-2 border border-gray-300 rounded' 
//             type="number" 
//             placeholder='Zip Code' 
//           />
//           <input 
//             className='w-full px-4 py-2 border border-gray-300 rounded' 
//             type="text" 
//             placeholder='Country' 
//           />
//         </div>
//         <input 
//           className='w-full px-4 py-2 border border-gray-300 rounded' 
//           type="number" 
//           placeholder='Mobile' 
//         />
//       </div>
//       {/* Right Side Content */}
//       <div className='mt-8'>
//         <div className='mt-8 min-w-80'>
//           <CartTotal />
//         </div>
//         {/* Payment Methods Selection */}
//         <div className='mt-12'>
//           <Title text1={'PAYMENT'} text2={'METHODS'} />
//           {/* <div className='flex flex-col gap-3 lg:flex-row'>
//             <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 p-2 px-3 border cursor-pointer'>
//               <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-600' : ''}`}></p>
//               <img className='h-5 mx-4' src={assets.stripe_logo} alt="Stripe" />
//             </div>
//             <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 p-2 px-3 border cursor-pointer'>
//               <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-600' : ''}`}></p>
//               <img className='h-5 mx-4' src={assets.razorpay_logo} alt="RazorPay" />
//             </div>
//             <div onClick={() => setMethod('cod')} className='flex items-center gap-3 p-2 px-3 border cursor-pointer'>
//               <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-600' : ''}`}></p>
//               <p className='mx-4 text-sm font-medium text-gray-500'>CASH ON DELIVERY</p>
//             </div>
//           </div> */}
//           <div className='w-full mt-8 text-end'>
//             <button  className='px-16 py-3 text-sm text-white bg-black active:bg-gray-800'>PLACE ORDER</button>
//             {/* <button onClick={() => navigate('/orders')} className='px-16 py-3 text-sm text-white bg-black active:bg-gray-800'>PLACE ORDER</button> */}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default PlaceOrder
import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    area: '',
    country: '',
    mobile: ''
  });
  const { navigate } = useContext(ShopContext);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    // Form validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.street || !formData.city || !formData.state || 
        !formData.country || !formData.mobile) {
      return;
    }
    setShowSuccess(true);
  };

  return (
    <>
      <div className='flex flex-col lg:flex-row justify-between gap-8 pt-5 sm:pt-14 min-h-[80vh] border-t'>
        {/* Left Side - Delivery Information */}
        <div className='flex flex-col gap-5 w-full lg:max-w-[500px]'>
          <div className='text-xl sm:text-2xl mb-2'>
            <Title text1={'DELIVERY'} text2={'INFORMATION'} />
          </div>

          <form onSubmit={handlePlaceOrder} className='flex flex-col gap-4'>
            <div className='flex gap-3'>
              <div className='flex-1'>
                <input 
                  required 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all' 
                  type="text" 
                  placeholder='First Name' 
                />
              </div>
              <div className='flex-1'>
                <input 
                  required 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all' 
                  type="text" 
                  placeholder='Last Name' 
                />
              </div>
            </div>

            <input 
              required 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all' 
              type="email" 
              placeholder='Email Address' 
            />
            
            <input 
              required 
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all' 
              type="text" 
              placeholder='Street Address' 
            />

            <div className='flex gap-3'>
              <div className='flex-1'>
                <input 
                  required 
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all' 
                  type="text" 
                  placeholder='City' 
                />
              </div>
              <div className='flex-1'>
                <input 
                  required 
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all' 
                  type="text" 
                  placeholder='State / Province' 
                />
              </div>
            </div>

            <div className='flex gap-3'>
              <div className='flex-1'>
                <input 
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all' 
                  type="text" 
                  placeholder='Area / Locality (Optional)' 
                />
              </div>
              <div className='flex-1'>
                <input 
                  required 
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all' 
                  type="text" 
                  placeholder='Country' 
                />
              </div>
            </div>

            <input 
              required 
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all' 
              type="tel" 
              placeholder='Mobile Number' 
            />
          </form>
        </div>

        {/* Right Side - Cart Total & Payment */}
        <div className='w-full lg:w-auto lg:min-w-[400px]'>
          <div className='bg-gray-50 rounded-lg p-6 mb-8'>
            <CartTotal />
          </div>

          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='mb-6'>
              <Title text1={'PAYMENT'} text2={'METHOD'} />
              <p className='text-sm text-gray-500 mt-2'>Choose your preferred payment method</p>
            </div>

            <div className='flex flex-col gap-3'>
              {/* Cash on Delivery */}
              <div
                onClick={() => setMethod('cod')}
                className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  method === 'cod' 
                    ? 'border-black bg-gray-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  method === 'cod' 
                    ? 'bg-black border-black' 
                    : 'border-gray-400 bg-white'
                }`}>
                  {method === 'cod' && (
                    <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                    </svg>
                  )}
                </div>
                <div className='flex-1'>
                  <p className='text-gray-900 font-semibold'>Cash on Delivery</p>
                  <p className='text-xs text-gray-500 mt-0.5'>Pay when you receive your order</p>
                </div>
                <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
              </div>

              {/* eSewa */}
              <div
                onClick={() => setMethod('esewa')}
                className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  method === 'esewa' 
                    ? 'border-black bg-gray-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  method === 'esewa' 
                    ? 'bg-black border-black' 
                    : 'border-gray-400 bg-white'
                }`}>
                  {method === 'esewa' && (
                    <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                    </svg>
                  )}
                </div>
                <div className='flex items-center gap-3 flex-1'>
                  {/* eSewa Logo */}
                  <div className='h-12 w-32 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 p-2'>
                    <div className='flex items-center gap-2'>
                      {/* eSewa Icon - Green circle with white 'e' */}
                      <div className='w-9 h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm'>
                        <span className='text-white text-xl font-bold' style={{ fontFamily: 'Arial, sans-serif' }}>e</span>
                      </div>
                      {/* eSewa Text */}
                      <div className='flex items-baseline gap-0.5'>
                        <span className='text-gray-900 text-base font-bold' style={{ fontFamily: 'Arial, sans-serif' }}>Sewa</span>
                        <span className='text-[7px] text-gray-600 leading-none'>™</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className='text-gray-900 font-semibold'>eSewa</p>
                    <p className='text-xs text-gray-500 mt-0.5'>Pay with eSewa wallet</p>
                  </div>
                </div>
              </div>

              {/* Khalti */}
              <div
                onClick={() => setMethod('khalti')}
                className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  method === 'khalti' 
                    ? 'border-black bg-gray-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  method === 'khalti' 
                    ? 'bg-black border-black' 
                    : 'border-gray-400 bg-white'
                }`}>
                  {method === 'khalti' && (
                    <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                    </svg>
                  )}
                </div>
                <div className='flex items-center gap-3 flex-1'>
                  {/* Khalti Logo */}
                  <div className='h-12 w-32 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 p-2'>
                    <div className='flex items-center gap-1.5'>
                      {/* Khalti Icon - Purple square with 'K' */}
                      <div className='w-9 h-9 bg-[#5C2D91] rounded-md flex items-center justify-center flex-shrink-0 shadow-sm'>
                        <span className='text-white text-lg font-bold' style={{ fontFamily: 'Arial, sans-serif' }}>K</span>
                      </div>
                      {/* Khalti Text */}
                      <span className='text-gray-900 text-base font-bold' style={{ fontFamily: 'Arial, sans-serif' }}>halti</span>
                    </div>
                  </div>
                  <div>
                    <p className='text-gray-900 font-semibold'>Khalti</p>
                    <p className='text-xs text-gray-500 mt-0.5'>Pay with Khalti wallet</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='w-full mt-8'>
              <button
                type='submit'
                onClick={handlePlaceOrder}
                className='w-full px-8 py-4 text-base font-semibold text-white bg-black hover:bg-gray-800 active:bg-gray-900 transition-all rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccess && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl relative animate-fadeIn'>
            <button
              onClick={() => {
                setShowSuccess(false);
                navigate('/orders'); // Optional: redirect
              }}
              className='absolute top-3 right-3 text-gray-500 hover:text-black text-2xl'
            >
              ×
            </button>
            <div className='text-center'>
              <div className='mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                <svg className='w-10 h-10 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                </svg>
              </div>
              <h3 className='text-2xl font-bold text-gray-800'>Order Placed Successfully!</h3>
              <p className='text-gray-600 mt-2'>Thank you for shopping with us.</p>
              <p className='text-sm text-gray-500 mt-4'>Your order has been received and is being processed.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaceOrder;