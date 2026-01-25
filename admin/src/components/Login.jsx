import React, { useState } from "react";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import { loginAdminApi } from "../api/api";
import { useNavigate } from "react-router-dom";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault(); // Prevent page reload

    try {
      const response = await loginAdminApi({ email, password });
      const { token } = response.data;

      if (!token) {
        toast.error("Login failed. Please try again.");
        return;
      }

      localStorage.clear();
      localStorage.setItem("token", token);
      localStorage.setItem("adminEmail", email);

      setToken(token);
      toast.success("Admin Login Successful");

      navigate("/"); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-50">
      <div className="max-w-md w-full px-8 py-6 bg-white rounded-lg shadow-md">
        <div className="mb-4 text-center">
          <img src={assets.logo} alt="Trendify" className="mx-auto h-12" />
          <h1 className="mt-2 text-2xl font-bold">Admin Dashboard Login</h1>
        </div>

        <form onSubmit={onSubmitHandler}>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="mb-6 text-right">
            <button
              type="button"
              onClick={() => {
                toast.info("Please contact the system administrator to reset your admin password");
              }}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 ml-auto w-fit"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                />
              </svg>
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white bg-black rounded-md hover:bg-gray-900 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
