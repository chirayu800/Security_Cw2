import React, { useEffect, useRef, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsLetterBox'

const About = () => {
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
      { threshold: 0.1 }
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

  return (
    <div>
      {/* Header Section */}
      <div className='pt-10 text-2xl text-center border-t mb-12'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>

      {/* Main Content Section */}
      <div ref={sectionRef} className='flex flex-col gap-12 my-12 lg:flex-row lg:gap-16'>
        {/* Image Section */}
        <div className={`w-full lg:w-1/2 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}>
          <div className='rounded-lg overflow-hidden shadow-lg'>
            <img 
              className='w-full h-auto object-cover' 
              src={assets.about_img} 
              alt="About Photo" 
            />
          </div>
        </div>

        {/* Text Content Section */}
        <div className={`w-full lg:w-1/2 flex flex-col justify-center gap-8 transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        }`}>
          <div className='space-y-6'>
            <p className='text-base leading-relaxed text-gray-700'>
              Welcome to <span className='font-semibold text-gray-900'>Trendify</span>, where style meets quality. Our mission is to bring you the latest fashion trends and must-have items, all curated with an eye for quality and design. We believe that everyone deserves to express themselves through fashion, and we're here to make that easier and more enjoyable. Our collections are carefully selected to offer you a range of options that cater to every taste and occasion.
            </p>
            
            <p className='text-base leading-relaxed text-gray-700'>
              At Trendify, we prioritize your satisfaction. From the moment you browse our site to the day your order arrives, we are dedicated to providing a seamless shopping experience. Our team is always on the lookout for the latest trends, ensuring that you have access to the freshest styles as soon as they hit the runway. Thank you for choosing Trendify. We're excited to be a part of your style journey.
            </p>
          </div>

          {/* Mission Section */}
          <div className='bg-gray-50 rounded-lg p-6 border-l-4 border-purple-600'>
            <h3 className='text-xl font-bold text-gray-900 mb-3 flex items-center gap-2'>
              <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              Our Mission
            </h3>
            <p className='text-base leading-relaxed text-gray-700'>
              At Trendify, our mission is to empower you to express your unique style with high-quality, on-trend fashion. We strive to make fashion accessible to all, offering diverse products that inspire confidence.
            </p>
          </div>

          {/* Vision Section */}
          <div className='bg-gray-50 rounded-lg p-6 border-l-4 border-blue-600'>
            <h3 className='text-xl font-bold text-gray-900 mb-3 flex items-center gap-2'>
              <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
              </svg>
              Our Vision
            </h3>
            <p className='text-base leading-relaxed text-gray-700'>
              At Trendify, our vision is to be a global fashion leader, known for cutting-edge style and quality. We aim to inspire confidence and creativity, making Trendify the go-to choice for individual expression.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className='my-16'>
        <div className='text-center mb-12'>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
          <p className='text-gray-600 mt-4 max-w-2xl mx-auto'>
            Discover what makes Trendify the perfect choice for your fashion needs
          </p>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-20'>
          {/* Quality Assurance Card */}
          <div className={`bg-white rounded-lg shadow-md p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '0.1s' }}>
            <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6'>
              <svg className='w-8 h-8 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>Quality Assurance</h3>
            <p className='text-gray-600 leading-relaxed'>
              At Trendify, quality comes first. Every product is carefully chosen and inspected to meet our high standards. Shop with confidence, knowing we ensure excellence in every detail.
            </p>
          </div>

          {/* Convenience Card */}
          <div className={`bg-white rounded-lg shadow-md p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '0.3s' }}>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6'>
              <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
              </svg>
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>Convenience</h3>
            <p className='text-gray-600 leading-relaxed'>
              Trendify ensures a smooth shopping experience with easy browsing, fast shipping, simple returns, and multiple payment options. Your comfort and satisfaction are our priorities.
            </p>
          </div>

          {/* Customer Service Card */}
          <div className={`bg-white rounded-lg shadow-md p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '0.5s' }}>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6'>
              <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' />
              </svg>
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>Exceptional Customer Service</h3>
            <p className='text-gray-600 leading-relaxed'>
              At Trendify, exceptional service is our promise. Our dedicated support team is here to assist you with any questions or concerns, ensuring a smooth and satisfying shopping experience.
            </p>
          </div>
        </div>
      </div>

      <NewsLetterBox />
    </div>
  )
}

export default About
