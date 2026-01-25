import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPasswordApi } from "../api/api";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenSent, setTokenSent] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await forgotPasswordApi({ email });

      if (response.data.success) {
        toast.success(response.data.message);
        setTokenSent(true);
        // In demo mode, show the token (remove in production)
        if (response.data.resetToken) {
          setResetToken(response.data.resetToken);
          toast.info(`Demo: Your reset token is ${response.data.resetToken}`, {
            autoClose: 10000,
          });
        }
      } else {
        toast.error(response.data.message || "Failed to send reset token");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mt-10 mb-2">
        <p className="text-3xl prata-regular">Forgot Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {!tokenSent ? (
        <>
          <p className="text-sm text-center text-gray-600 mb-4">
            Enter your email address and we'll send you a password reset token.
          </p>

          <form onSubmit={onSubmitHandler} className="flex flex-col w-full gap-4">
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 mt-4 font-light text-white bg-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Token"}
            </button>
          </form>

          <div className="flex justify-center w-full text-sm mt-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-800">
              Back to Login
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center w-full gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-green-800 mb-2">
              Reset token has been sent!
            </p>
            {resetToken && (
              <p className="text-xs text-gray-600 mb-4">
                Demo Token: <span className="font-mono font-bold">{resetToken}</span>
              </p>
            )}
            <p className="text-xs text-gray-600">
              Please check your email for the reset token, then proceed to reset your password.
            </p>
          </div>

          <button
            onClick={() => navigate("/reset-password")}
            className="px-8 py-2 font-light text-white bg-black"
          >
            Reset Password
          </button>

          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800">
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;

