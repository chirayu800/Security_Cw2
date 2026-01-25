import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'

const RelatedProducts = ({category, subCategory}) => {

    const {products, loading} = useContext(ShopContext);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        if (products && products.length > 0 && category && subCategory) {
            let productsCopy = products.slice();
            productsCopy = productsCopy.filter((item) => category === item.category);
            productsCopy = productsCopy.filter((item) => subCategory === item.subCategory);
            setRelated(productsCopy.slice(0, 5));
        } else {
            setRelated([]);
        }
    }, [products, category, subCategory]);

  return (
    <div className='my-24'>
        <div className='py-2 text-3xl text-center'>
            <Title text1={'RELATED'} text2={'PRODUCTS'} />
        </div>
        {loading ? (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-600">Loading related products...</p>
            </div>
        ) : related.length === 0 ? (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-600">No related products found</p>
            </div>
        ) : (
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6'>
                {related.map((item, index) => (
                    <ProductItem
                        key={item._id || index}
                        id={item._id}
                        name={item.name}
                        image={item.image}
                        price={item.price}
                    />
                ))}
            </div>
        )}
    </div>
  )
}

export default RelatedProducts
