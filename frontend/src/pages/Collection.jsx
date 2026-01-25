import React, { useEffect, useState, useContext, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { getAllProductApi } from "../api/api";
import { ShopContext } from "../context/ShopContext";

const Collection = () => {
  const { search } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const [showFilter, setShowFilter] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const collectionRef = useRef(null);
  const filterRef = useRef(null);
  const productRef = useRef(null);

  // Check URL params for category filter
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setCategory([categoryParam]);
    }
  }, [searchParams]);

  // Intersection Observer for animations
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

    if (collectionRef.current) {
      observer.observe(collectionRef.current);
    }
    if (filterRef.current) {
      observer.observe(filterRef.current);
    }
    if (productRef.current) {
      observer.observe(productRef.current);
    }

    return () => {
      if (collectionRef.current) {
        observer.unobserve(collectionRef.current);
      }
      if (filterRef.current) {
        observer.unobserve(filterRef.current);
      }
      if (productRef.current) {
        observer.unobserve(productRef.current);
      }
    };
  }, [filterProducts]);

  // Toggle category checkbox
  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  // Toggle subCategory checkbox
  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
  };

  // Apply filters to product list
  const applyFilter = (productList = products) => {
    let filtered = [...productList];

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter((item) => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.subCategory?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (category.length > 0) {
      filtered = filtered.filter((item) => category.includes(item.category));
    }

    // Apply subCategory filter
    if (subCategory.length > 0) {
      filtered = filtered.filter((item) => subCategory.includes(item.subCategory));
    }

    setFilterProducts(filtered);
  };

  // Sort products by price
  const sortProduct = () => {
    let sorted = [...filterProducts];
    if (sortType === "low-high") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortType === "high-low") {
      sorted.sort((a, b) => b.price - a.price);
    }
    setFilterProducts(sorted);
  };

  // Fetch products once
  const getAllProduct = async () => {
    try {
      const response = await getAllProductApi();
      if (response.status === 200 || response.status === 201) {
        const data = response.data.products;
        setProducts(data);
        setFilterProducts(data); // Initially show all
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    getAllProduct();
  }, []);

  useEffect(() => {
    applyFilter(); // when category, subCategory, or search changes
  }, [category, subCategory, search, products]);

  useEffect(() => {
    sortProduct(); // when sortType changes
  }, [sortType]);

  return (
    <div ref={collectionRef} className="flex flex-col gap-1 pt-10 border-t sm:flex-row sm:gap-10">
      {/* Filter Section */}
      <div 
        ref={filterRef}
        className={`min-w-60 transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
        }`}
      >
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 my-2 text-xl cursor-pointer transition-all duration-300 hover:text-gray-600"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden transition-transform duration-300 ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt="Dropdown"
          />
        </p>

        {/* Category */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 transition-all duration-500 delay-300 ${
            showFilter ? "" : "hidden"
          } sm:block ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {["Men", "Women", "Kids"].map((item, index) => (
              <label 
                key={item} 
                className={`flex gap-2 cursor-pointer transition-all duration-300 hover:text-gray-900 hover:translate-x-1 delay-${index * 100}`}
              >
                <input
                  className="w-3 cursor-pointer"
                  type="checkbox"
                  value={item}
                  onChange={toggleCategory}
                  checked={category.includes(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        {/* Sub Category */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 transition-all duration-500 delay-400 ${
            showFilter ? "" : "hidden"
          } sm:block ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="mb-3 text-sm font-medium">TYPES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {["Topwear", "Bottomwear", "Winterwear"].map((item, index) => (
              <label 
                key={item} 
                className={`flex gap-2 cursor-pointer transition-all duration-300 hover:text-gray-900 hover:translate-x-1 delay-${index * 100}`}
              >
                <input
                  className="w-3 cursor-pointer"
                  type="checkbox"
                  value={item}
                  onChange={toggleSubCategory}
                  checked={subCategory.includes(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        <button
          className={`px-4 py-2 mt-1 text-white bg-black rounded hover:bg-gray-900 transition-all duration-300 hover:scale-105 active:scale-95 ${
            showFilter ? "block" : "hidden"
          } sm:block ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Product List */}
      <div 
        ref={productRef}
        className={`flex-1 transition-all duration-700 delay-300 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        }`}
      >
        <div className="flex justify-between mb-4 text-base sm:text-2xl">
          <div className={`transition-all duration-500 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Title text1={"ALL"} text2={"COLLECTIONS"} />
          </div>

          <select
            onChange={(e) => setSortType(e.target.value)}
            className={`px-2 text-sm border-2 border-gray-300 rounded transition-all duration-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 gap-y-6">
          {filterProducts.map((item, index) => (
            <div
              key={item._id || index}
              className={`transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${600 + (index % 8) * 50}ms` }}
            >
              <ProductItem
                id={item._id}
                name={item.name}
                image={item.image.length > 0 ? item.image : assets.default_product_image} 
                price={item.price}
                product={item}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
