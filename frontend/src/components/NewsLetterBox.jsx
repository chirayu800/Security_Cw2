import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const NewsLetterBox = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [subscribed, setSubscribed] = useState(false)
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setIsVisible(true);
              }
            });
          },
          { threshold: 0.2 }
        );

        if (sectionRef.current) {
          observer.observe(sectionRef.current);
        }

        return () => {
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        };
    }, []);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(backendUrl + "/api/newsletter/subscribe", {
                email: email
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setSubscribed(true);
                setEmail('');
                // Reset subscribed state after 5 seconds
                setTimeout(() => {
                    setSubscribed(false);
                }, 5000);
            } else {
                toast.error(response.data.message || "Failed to subscribe");
            }
        } catch (error) {
            console.error("Newsletter subscription error:", error);
            toast.error(error.response?.data?.message || "Failed to subscribe. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    
  return (
    <div ref={sectionRef} className='mt-10 text-center'>
        <p className={`text-2xl font-medium text-gray-800 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>Unlock 20% Off | Subscribe Today!</p>
        <p className={`mt-3 text-gray-400 transition-all duration-700 delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>Don't miss out—unlock your savings now by subscribing below!</p>
        <form 
          onSubmit={onSubmitHandler} 
          className={`flex items-center w-full gap-3 pl-3 mx-auto my-6 border sm:w-1/2 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
            <input 
                className='w-full outline-none sm:flex-1 transition-all duration-300 focus:ring-2 focus:ring-black' 
                type="email" 
                placeholder='hello@gmail.com'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || subscribed}
            />
            <button 
                type='submit' 
                disabled={loading || subscribed}
                className='px-10 py-4 text-xs text-white bg-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95'
            >
                {loading ? 'SUBSCRIBING...' : subscribed ? 'SUBSCRIBED!' : 'SUBSCRIBE'}
            </button>
        </form>
        {subscribed && (
            <p className='text-sm text-green-600 mt-2 animate-fadeIn'>✓ Check your email for your 20% discount code!</p>
        )}
    </div>
  )
}

export default NewsLetterBox
