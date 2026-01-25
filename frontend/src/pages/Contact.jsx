import React, { useState, useEffect, useRef } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsLetterBox'
import { submitContactApi } from '../api/api'
import { toast } from 'react-toastify'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const contactRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (contactRef.current) {
      observer.observe(contactRef.current);
    }
    if (leftRef.current) {
      observer.observe(leftRef.current);
    }
    if (rightRef.current) {
      observer.observe(rightRef.current);
    }

    return () => {
      if (contactRef.current) {
        observer.unobserve(contactRef.current);
      }
      if (leftRef.current) {
        observer.unobserve(leftRef.current);
      }
      if (rightRef.current) {
        observer.unobserve(rightRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await submitContactApi(formData);
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div ref={contactRef} className={`pt-10 text-2xl text-center border-t transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <Title text1={'CONTACT'} text2={'US'} />
      </div>
      
      <div className='flex flex-col justify-center gap-10 my-10 lg:flex-row mb-28'>
        {/* Left Side - Contact Information */}
        <div 
          ref={leftRef}
          className={`w-full lg:w-1/2 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}
        >
          <div className='overflow-hidden rounded-lg'>
            <img 
              className='w-full md:max-w-[480px] mx-auto lg:mx-0 transition-transform duration-500 hover:scale-105' 
              src={assets.contact_img} 
              alt="Contact Photo" 
            />
          </div>
          <div className='flex flex-col items-start justify-center gap-6 mt-6'>
            <p className={`text-xl font-semibold text-gray-600 transition-all duration-500 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>Our Store</p>
            <p className={`text-gray-500 transition-all duration-500 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>Trendify 354 Fashion Lane <br />Kathmandu, Durbar Marg</p>
            <p className={`text-gray-500 transition-all duration-500 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>Tel: (+977) 9810771153 <br />Email: chirayubaij@gmail.com</p>
            <p className={`text-xl font-semibold text-gray-600 transition-all duration-500 delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>Careers at Trendify</p>
            <p className={`text-gray-500 transition-all duration-500 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>Join us at Trendify! Explore job openings and help shape the future of fashion. <br />Explore our current job openings and discover how you can contribute to our mission of setting trends and creating style.</p>
            <button className={`px-8 py-4 text-sm transition-all duration-500 border border-black hover:bg-gray-800 hover:text-white rounded-lg hover:scale-105 active:scale-95 delay-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Explore Jobs
            </button>
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <div 
          ref={rightRef}
          className={`w-full lg:w-1/2 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
        >
          <div className='bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow duration-300'>
            <h2 className={`text-2xl font-bold text-gray-800 mb-6 transition-all duration-500 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>Send us a Message</h2>
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className={`transition-all duration-500 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400'
                  placeholder='Enter your name'
                />
              </div>

              <div className={`transition-all duration-500 delay-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Your Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400'
                  placeholder='Enter your email'
                />
              </div>

              <div className={`transition-all duration-500 delay-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400'
                  placeholder='What is this regarding?'
                />
              </div>

              <div className={`transition-all duration-500 delay-800 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none hover:border-gray-400'
                  placeholder='Tell us how we can help you...'
                />
              </div>

              <div className={`transition-all duration-500 delay-900 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <button
                  type="submit"
                  disabled={loading}
                  className='w-full px-8 py-4 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95'
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <NewsLetterBox />
    </div>
  )
}

export default Contact
