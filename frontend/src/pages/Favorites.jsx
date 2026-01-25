import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'
import { toast } from 'react-toastify'

const Favorites = () => {
  const { currency, favorites, removeFromFavorites } = useContext(ShopContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [favorites]);

  if (loading) {
    return (
      <div className='pt-16 border-t'>
        <div className='text-2xl'>
          <Title text1={'MY'} text2={'FAVORITES'} />
        </div>
        <div className='flex items-center justify-center py-20'>
          <p className='text-gray-600'>Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className='pt-16 border-t'>
        <div className='text-2xl'>
          <Title text1={'MY'} text2={'FAVORITES'} />
        </div>
        <div className='flex flex-col items-center justify-center py-20'>
          <svg 
            className='w-20 h-20 text-gray-300 mb-4' 
            fill='none' 
            stroke='currentColor' 
            viewBox='0 0 24 24'
          >
            <path 
              strokeLinecap='round' 
              strokeLinejoin='round' 
              strokeWidth={2} 
              d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' 
            />
          </svg>
          <p className='text-gray-600 text-lg'>No favorites yet</p>
          <p className='text-gray-400 text-sm mt-2'>Start adding products to your favorites!</p>
        </div>
      </div>
    );
  }

  return (
    <div className='pt-16 border-t'>
      <div className='text-2xl mb-8'>
        <Title text1={'MY'} text2={'FAVORITES'} />
      </div>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 gap-y-6'>
        {favorites.map((item) => (
          <ProductItem
            key={item._id || item.id}
            id={item._id || item.id}
            name={item.name}
            image={item.image}
            price={item.price}
            product={item}
          />
        ))}
      </div>
    </div>
  )
}

export default Favorites

