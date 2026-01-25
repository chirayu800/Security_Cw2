import React, { useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);

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

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <div ref={heroRef} className='flex flex-col border border-gray-400 sm:flex-row overflow-hidden max-h-[500px]'>
        {/* Hero left side */}
        <div className={`flex items-center justify-center w-full py-8 sm:w-1/2 sm:py-0 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}>
            <div className='text-[#414141] px-6'>
                <div className='flex items-center gap-2'>
                    <p className={`w-8 md:w-11 h-[2px] bg-[#414141] transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}></p>
                    <p className={`text-sm font-medium md:text-base transition-all duration-700 delay-100 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}>OUR BEST SELLERS</p>
                </div>
                <h1 className={`text-2xl leading-relaxed sm:py-3 lg:text-4xl prata-regular transition-all duration-700 delay-200 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>Latest Arrivals</h1>
                <div className='flex items-center gap-2'>
                    <p className={`text-sm font-semibold md:text-base transition-all duration-700 delay-300 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}>SHOP NOW</p>
                    <p className={`w-8 md:w-11 h-[1px] bg-[#414141] transition-all duration-700 delay-300 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}></p>
                </div>
            </div>
        </div>
        {/* Hero right side */}
        <div className={`w-full sm:w-1/2 h-[500px] transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95'
        }`}>
          <img 
            className='w-full h-full object-cover' 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop&q=80" 
            alt="Hero Image" 
            onError={(e) => {
              e.target.src = assets.hero_img; // Fallback to original if new image fails
            }}
          />
        </div>
    </div>
  )
}

export default Hero
