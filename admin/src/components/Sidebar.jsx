import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r-2">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-500 border-r-0 px-3 py-2 rounded-lg ${
              isActive ? "bg-gray-300" : "bg-gray-200"
            }`
          }
          to={"/"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="hidden text-lg font-semibold md:block">Dashboard</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-500 border-r-0 px-3 py-2 rounded-lg ${
              isActive ? "bg-gray-300" : "bg-gray-200"
            }`
          }
          to={"/add"}
        >
          <img className="w-6 h-6" src={assets.add_icon} alt="Add Items" />
          <p className="hidden text-lg font-semibold md:block">Add Items</p>
        </NavLink>
        <NavLink
          className={
            "flex items-center gap-3 border border-gray-500 border-r-0 px-3 py-2 rounded-lg bg-gray-200"
          }
          to={"/list"}
        >
          <img className="w-6 h-6" src={assets.parcel_icon} alt="List Items" />
          <p className="hidden text-lg font-semibold md:block">List Items</p>
        </NavLink>
        <NavLink
          className={
            "flex items-center gap-3 border border-gray-500 border-r-0 px-3 py-2 rounded-lg bg-gray-200"
          }
          to={"/orders"}
        >
          <img className="w-6 h-6" src={assets.order_icon} alt="Orders" />
          <p className="hidden text-lg font-semibold md:block">Orders</p>
        </NavLink>
        <NavLink
          className={
            "flex items-center gap-3 border border-gray-500 border-r-0 px-3 py-2 rounded-lg bg-gray-200"
          }
          to={"/subscribers"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="hidden text-lg font-semibold md:block">Subscribers</p>
        </NavLink>
        <NavLink
          className={
            "flex items-center gap-3 border border-gray-500 border-r-0 px-3 py-2 rounded-lg bg-gray-200"
          }
          to={"/contacts"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="hidden text-lg font-semibold md:block">Contacts</p>
        </NavLink>
        <NavLink
          className={
            "flex items-center gap-3 border border-gray-500 border-r-0 px-3 py-2 rounded-lg bg-gray-200"
          }
          to={"/change-password"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <p className="hidden text-lg font-semibold md:block">Change Password</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;