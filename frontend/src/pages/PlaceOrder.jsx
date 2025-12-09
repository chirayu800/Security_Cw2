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
  const { navigate } = useContext(ShopContext);

  const handlePlaceOrder = () => {
    // Here you can add form validation later if needed
    setShowSuccess(true);
  };

  return (
    <>
      <div className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
        {/* Left Side - Delivery Information */}
        <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
          <div className='text-xl sm:text-2xl my-3'>
            <Title text1={'DELIVERY'} text2={'INFORMATION'} />
          </div>

          <div className='flex gap-3'>
            <input required className='w-full px-4 py-2 border border-gray-300 rounded' type="text" placeholder='First Name' />
            <input required className='w-full px-4 py-2 border border-gray-300 rounded' type="text" placeholder='Last Name' />
          </div>

          <input required className='w-full px-4 py-2 border border-gray-300 rounded' type="email" placeholder='Email Address' />
          <input required className='w-full px-4 py-2 border border-gray-300 rounded' type="text" placeholder='Street Address' />

          <div className='flex gap-3'>
            <input required className='w-full px-4 py-2 border border-gray-300 rounded' type="text" placeholder='City' />
            <input className='w-full px-4 py-2 border border-gray-300 rounded bg-gray-100' type="text" value="Bagmati Pradesh" readOnly />
          </div>

          <div className='flex gap-3'>
            <input required className='w-full px-4 py-2 border border-gray-300 rounded' type="text" placeholder='Area / Locality (Optional)' />
            <input className='w-full px-4 py-2 border border-gray-300 rounded bg-gray-100' type="text" value="Nepal" readOnly />
          </div>

          <input required className='w-full px-4 py-2 border border-gray-300 rounded' type="tel" placeholder='Mobile Number' />
        </div>

        {/* Right Side - Cart Total & Payment */}
        <div className='mt-8 w-full sm:w-auto'>
          <div className='mt-8 min-w-80'>
            <CartTotal />
          </div>

          <div className='mt-12'>
            <Title text1={'PAYMENT'} text2={'METHOD'} />

            <div className='flex flex-col gap-4 mt-6 mt-6'>
              {/* Cash on Delivery */}
              <div
                onClick={() => setMethod('cod')}
                className='flex items-center gap-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-black transition'
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'cod' ? 'bg-black border-black' : 'border-gray-400'}`}>
                  {method === 'cod' && <div className='w-3 h-3 bg-white rounded-full'></div>}
                </div>
                <p className='text-gray-700 font-medium'>Cash on Delivery</p>
              </div>

              {/* eSewa */}
              <div
                onClick={() => setMethod('esewa')}
                className='flex items-center gap-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-black transition'
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'esewa' ? 'bg-black border-black' : 'border-gray-400'}`}>
                  {method === 'esewa' && <div className='w-3 h-3 bg-white rounded-full'></div>}
                </div>
                <img className='h-9' src={assets.esewa_logo || 'https://cdn.esewa.com.np/ui/images/logos/esewa-logo.png'} alt="eSewa" />
                <p className='text-gray-700 font-medium'>eSewa</p>
              </div>

              {/* Fonepay */}
              <div
                onClick={() => setMethod('fonepay')}
                className='flex items-center gap-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-black transition'
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'fonepay' ? 'bg-black border-black' : 'border-gray-400'}`}>
                  {method === 'fonepay' && <div className='w-3 h-3 bg-white rounded-full'></div>}
                </div>
                <img className='h-10' src={assets.fonepay_logo || 'https://fonepay.com/assets/images/fonepay-logo.png'} alt="Fonepay" />
                <p className='text-gray-700 font-medium'>Fonepay</p>
              </div>
            </div>

            <div className='w-full text-end mt-10'>
              <button
                onClick={handlePlaceOrder}
                className='px-16 py-3 text-sm font-medium text-white bg-black hover:bg-gray-800 active:bg-gray-900 transition-all'
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
                <span className='text-4xl'>Checkmark</span>
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