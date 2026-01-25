import React, { useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
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

  return (
    <div ref={sectionRef} className='flex flex-col justify-around gap-12 py-8 text-xs text-center text-gray-700 sm:flex-row sm:gap-2 sm:text-sm md:text-base'>
        <div className={`transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '0.1s' }}>
            <img 
              src={assets.exchange_icon} 
              className='w-12 m-auto mb-3 transition-transform duration-300 hover:scale-110' 
              alt="Exchange" 
            />
            <p className='mb-2 font-semibold'>Easy Return & Exchange Policy</p>
            <p className='text-gray-400'>
                Easy Returns/exchanges within 10 days.
            </p>
        </div>
        <div className={`transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '0.3s' }}>
            <img 
              src={assets.quality_icon} 
              className='w-12 m-auto mb-3 transition-transform duration-300 hover:scale-110' 
              alt="Quality" 
            />
            <p className='mb-2 font-semibold'>Our Quality Policy</p>
            <p className='text-gray-400'>
                Trendify ensures top-quality products.
            </p>
        </div>
        <div className={`transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '0.5s' }}>
            <img 
              src={assets.support_img} 
              className='w-12 m-auto mb-3 transition-transform duration-300 hover:scale-110' 
              alt="Support" 
            />
            <p className='mb-2 font-semibold'>Best Customer Support</p>
            <p className='text-gray-400'>
                We support via email, phone, or chat.
            </p>
        </div>
    </div>
  )
}

export default OurPolicy
