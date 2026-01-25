import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price, product }) => {
  const { currency, isFavorite, toggleFavorite } = useContext(ShopContext);
  const [favorite, setFavorite] = useState(false);

  // Handle image - can be array or single string
  const imageUrl = Array.isArray(image) ? image[0] : image;

  useEffect(() => {
    if (id) {
      setFavorite(isFavorite(id));
    }
  }, [id, isFavorite]);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product) {
      toggleFavorite(product);
      setFavorite(!favorite);
    }
  };

  return (
    <div className="relative text-gray-700 cursor-pointer group">
      <Link to={`/product/${id}`}>
        <div className="overflow-hidden rounded-lg relative">
          <img
            className="w-full h-64 object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-105"
            src={imageUrl || "https://via.placeholder.com/300"}
            alt={name || "Product"}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300";
            }}
          />
          {/* Favorite Icon */}
          {product && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-all duration-300 hover:scale-110 z-10"
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg
                className={`w-5 h-5 transition-all duration-300 ${
                  favorite ? "text-red-500 fill-red-500" : "text-gray-600"
                }`}
                fill={favorite ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}
        </div>
        <p className="pt-3 pb-1 text-sm transition-colors duration-300 group-hover:text-gray-900">{name}</p>
        <p className="text-sm font-medium transition-colors duration-300 group-hover:text-black">
          {currency}&nbsp;
          {price?.toLocaleString('en-NP', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || '0.00'}
        </p>
      </Link>
    </div>
  );
};

export default ProductItem;
