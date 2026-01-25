import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { getAllCartItems } from '../api/api';

const NavBar = () => {
    const [visible, setVisible] = useState(false);
    const { setShowSearch, favorites } = useContext(ShopContext);
    const [cartLength, setCartLength] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        cartItems();
    }, []);

    const cartItems = async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;

            const user = JSON.parse(userStr);
            const userId = user._id;

            const res = await getAllCartItems(userId);
            console.log(res)
            if (res.status == 200 || res.status === 201) {
                console.log(res.data)
                setCartLength(res.data.cart.length || 0);
            } else {
                console.log("Failed to fetch cart items");
            }
        } catch (error) {
            console.log(error)
        }
    }

      const handleLogout = () => {
        localStorage.clear(); 
        navigate("/login");
        window.location.reload()
    };


    return (
        <div className='flex items-center justify-between py-5 font-medium'>
            <Link to='/'>
                <img src={assets.logo} className='w-36' alt="Trendify" />
            </Link>
            <ul className='hidden gap-5 text-sm text-gray-700 sm:flex'>
                <NavLink to='/' className='flex flex-col items-center gap-1'>
                    <p>HOME</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/collection' className='flex flex-col items-center gap-1'>
                    <p>COLLECTION</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/about' className='flex flex-col items-center gap-1'>
                    <p>ABOUT</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/contact' className='flex flex-col items-center gap-1'>
                    <p>CONTACT</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
            </ul>
            <div className='flex items-center gap-6'>
                <img
                    onClick={() => setShowSearch(true)}
                    src={assets.search_icon}
                    className='w-5 cursor-pointer'
                    alt="Search Products"
                />
                <Link to='/favorites' className='relative'>
                    <svg 
                        className='w-5 h-5 cursor-pointer text-gray-700 hover:text-red-500 transition-colors' 
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
                    {favorites && favorites.length > 0 && (
                        <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-red-500 text-white aspect-square rounded-full text-[8px]'>
                            {favorites.length > 9 ? '9+' : favorites.length}
                        </p>
                    )}
                </Link>
                <div className='relative group'>
                    <Link to='/login'>
                        <img src={assets.profile_icon} className='w-5 cursor-pointer' alt="Your Profile" />
                    </Link>
                    <div className='absolute right-0 hidden pt-4 group-hover:block dropdown-menu z-50'>
                        <div className='flex flex-col gap-4 px-5 py-4 text-gray-500 rounded-lg w-40 bg-slate-100 shadow-lg border border-gray-200'>
                            <Link to="/profile" className='cursor-pointer hover:text-black transition-colors'>
                                <p>Profile</p>
                            </Link>
                            <Link to="/orders" className='cursor-pointer hover:text-black transition-colors'>
                                <p>Orders</p>
                            </Link>
                            <div className='border-t border-gray-300 pt-2 mt-1'>
                                <p onClick={() => handleLogout()} className='cursor-pointer hover:text-red-600 transition-colors font-medium'>Logout</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Link to='/cart' className='relative'>
                    <img src={assets.cart_icon} className='w-5 min-w-5' alt="Cart" />
                    <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{cartLength}</p>
                </Link>
                <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="Menu Icon" />
            </div>

            {/* INFO: Sidbar menu for smaller screens */}
            <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
                <div className='flex flex-col text-gray-600'>
                    <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
                        <img src={assets.dropdown_icon} className='h-4 rotate-180' alt="Dropdown" />
                        <p>Back</p>
                    </div>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/'>HOME</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/collection'>COLLECTION</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>
                </div>
            </div>
        </div>
    )
}

export default NavBar
