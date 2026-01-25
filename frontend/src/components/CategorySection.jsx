import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const CategorySection = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const categoryRef = useRef(null);

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

    if (categoryRef.current) {
      observer.observe(categoryRef.current);
    }

    return () => {
      if (categoryRef.current) {
        observer.unobserve(categoryRef.current);
      }
    };
  }, []);

  // Get product images for categories - using representative images
  const categories = [
    {
      name: "Men",
      image: assets.p_img2_1,
    },
    {
      name: "Women",
      image: assets.p_img1,
    },
    {
      name: "Kids",
      image: assets.p_img3,
    }
  ];

  const handleCategoryClick = (category) => {
    navigate(`/collection?category=${category}`);
  };

  return (
    <div ref={categoryRef} className='py-12 px-4 sm:px-8 bg-gray-50'>
      <div className='max-w-7xl mx-auto'>
        <h2 className={`text-3xl font-bold text-center mb-8 text-gray-800 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          Shop by Category
        </h2>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8'>
          {categories.map((category, index) => (
            <div
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className={`group relative overflow-hidden rounded-lg shadow-lg cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: `${index * 150}ms`,
                width: '100%',
                height: '500px'
              }}
            >
              <div className='relative w-full h-full'>
                <img
                  src={category.image}
                  alt={category.name}
                  className='w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110'
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.src = assets.hero_img; // Fallback image
                  }}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent'></div>
                <div className='absolute bottom-0 left-0 right-0 p-6 text-center'>
                  <h3 className='text-3xl font-bold text-white mb-2 transition-all duration-300 group-hover:translate-y-[-5px]'>
                    {category.name}
                  </h3>
                  <button className='px-6 py-2 bg-white text-gray-800 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform group-hover:scale-105'>
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategorySection

