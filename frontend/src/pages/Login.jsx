// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { loginApi, registerApi } from "../api/api";
// import { toast } from "react-toastify";

// const Login = () => {
//   const [currentState, setCurrentState] = useState("Login"); // default to Login
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const onSubmitHandler = async (event) => {
//     event.preventDefault();

//     if (currentState === "Sign Up") {
//       try {
//         const response = await registerApi({ name, email, password });
//         const { token, user } = response.data;

//         localStorage.clear();

//         localStorage.setItem("token", token);
//         localStorage.setItem("user", JSON.stringify(user));

//         toast.success("Register Successfull")
//         navigate("/");

//       } catch (error) {
//         toast.error(error.response?.data?.message || "Login failed. Please try again.");
//         console.error("Login Error:", error);
//       }
//       setCurrentState("Login");
//       setName("");
//       setEmail("");
//       setPassword("");

//     } else {
//       try {
//         const response = await loginApi({ email, password });
//         const { token, user } = response.data;
//         localStorage.clear();

//         // Save token
//         localStorage.setItem("token", token);
//         localStorage.setItem("user", JSON.stringify(user));

//         toast.success("Login Successfull")
//         navigate("/");
//         window.location.reload()
//       } catch (error) {
//         toast.error(error.response?.data?.message || "Login failed. Please try again.");
//         console.error("Login Error:", error);
//       }

//       setName("");
//       setEmail("");
//       setPassword("");
//     }
//   };

//   return (
//     <form
//       onSubmit={onSubmitHandler}
//       className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
//     >
//       <div className="inline-flex items-center gap-2 mt-10 mb-2">
//         <p className="text-3xl prata-regular">{currentState}</p>
//         <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
//       </div>

//       {currentState === "Sign Up" && (
//         <input
//           type="text"
//           className="w-full px-3 py-2 border border-gray-800"
//           placeholder="Enter your name"
//           required
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//       )}

//       <input
//         type="email"
//         className="w-full px-3 py-2 border border-gray-800"
//         placeholder="Enter your email"
//         required
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <input
//         type="password"
//         className="w-full px-3 py-2 border border-gray-800"
//         placeholder="Enter your password"
//         required
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />

//       <div className="flex justify-between w-full text-sm mt-[-8px]">
//         <p className="cursor-pointer">Forgot your password?</p>
//         {currentState === "Login" ? (
//           <p
//             onClick={() => setCurrentState("Sign Up")}
//             className="cursor-pointer"
//           >
//             Create a new account
//           </p>
//         ) : (
//           <p
//             onClick={() => setCurrentState("Login")}
//             className="cursor-pointer"
//           >
//             Login here
//           </p>
//         )}
//       </div>

//       <button
//         type="submit"
//         className="px-8 py-2 mt-4 font-light text-white bg-black"
//       >
//         {currentState === "Login" ? "Sign In" : "Sign Up"}
//       </button>
//     </form>
//   );
// };

// export default Login;


import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginApi, registerApi } from "../api/api";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login"); // default to Login
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, label: "", color: "" });
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const navigate = useNavigate();

  // Check lockout status on component mount and when state changes
  useEffect(() => {
    // Clear lockout if user just came from registration (check URL or localStorage flag)
    const justRegistered = sessionStorage.getItem('justRegistered');
    if (justRegistered === 'true') {
      localStorage.removeItem('loginLockout');
      localStorage.removeItem('loginFailedAttempts');
      sessionStorage.removeItem('justRegistered');
    }
    const checkLockoutStatus = () => {
      const lockoutData = localStorage.getItem('loginLockout');
      
      if (lockoutData) {
        const { failedAttempts, lockoutUntil } = JSON.parse(lockoutData);
        const now = Date.now();
        
        // If still locked out, calculate remaining time
        if (lockoutUntil && now < lockoutUntil) {
          const remaining = Math.ceil((lockoutUntil - now) / 1000); // in seconds
          setIsLockedOut(true);
          setLockoutTimeRemaining(remaining);
          return true;
        } else if (lockoutUntil && now >= lockoutUntil) {
          // Lockout period has expired, reset
          localStorage.removeItem('loginLockout');
          setIsLockedOut(false);
          setLockoutTimeRemaining(0);
          return false;
        }
      }
      
      setIsLockedOut(false);
      return false;
    };

    checkLockoutStatus();
    
    // Update countdown every second if locked out
    let interval;
    if (isLockedOut) {
      interval = setInterval(() => {
        const lockoutData = localStorage.getItem('loginLockout');
        if (lockoutData) {
          const { lockoutUntil } = JSON.parse(lockoutData);
          const now = Date.now();
          
          if (lockoutUntil && now < lockoutUntil) {
            const remaining = Math.ceil((lockoutUntil - now) / 1000);
            setLockoutTimeRemaining(remaining);
          } else {
            // Lockout expired
            localStorage.removeItem('loginLockout');
            setIsLockedOut(false);
            setLockoutTimeRemaining(0);
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLockedOut]);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      return { level: 1, label: "Weak", color: "red" };
    } else if (strength <= 4) {
      return { level: 2, label: "Medium", color: "yellow" };
    } else {
      return { level: 3, label: "Strong", color: "green" };
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (currentState === "Sign Up" && value) {
      if (!validateEmail(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (currentState === "Sign Up" && value) {
      setPasswordStrength(calculatePasswordStrength(value));
      // Re-validate confirm password if it exists
      if (confirmPassword) {
        if (value !== confirmPassword) {
          setConfirmPasswordError("Passwords do not match");
        } else {
          setConfirmPasswordError("");
        }
      }
    } else {
      setPasswordStrength({ level: 0, label: "", color: "" });
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (currentState === "Sign Up") {
      if (value && value !== password) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (currentState === "Sign Up") {
      // Validate email format before submitting
      if (!validateEmail(email)) {
        setEmailError("Please enter a valid email address");
        return;
      }

      // Validate password match
      if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
        return;
      }
      
      try {
        const response = await registerApi({ name, email, password });

        if (response.data && response.data.success) {
          // IMPORTANT: Clear ALL lockout and failed attempt data on successful registration
          localStorage.removeItem('loginLockout');
          localStorage.removeItem('loginFailedAttempts');
          
          // Clear all form fields
          setName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setEmailError("");
          setConfirmPasswordError("");
          setPasswordStrength({ level: 0, label: "", color: "" });
          
          // Show success message
          toast.success("Registration Successful! Redirecting to login...");
          
          // Set flag that user just registered (so we don't count first login attempt as failure)
          sessionStorage.setItem('justRegistered', 'true');
          
          // Small delay to show success message, then navigate to login page
          setTimeout(() => {
            navigate("/login");
          }, 1500);
          
        } else {
          throw new Error(response.data?.message || "Registration failed");
        }

      } catch (error) {
        toast.error(error.response?.data?.message || "Registration failed. Please try again.");
        console.error("Registration Error:", error);
        console.error("Error Response:", error.response?.data);
      }

    } else {
      // Check if user is locked out before attempting login
      const lockoutData = localStorage.getItem('loginLockout');
      if (lockoutData) {
        const { lockoutUntil } = JSON.parse(lockoutData);
        const now = Date.now();
        
        if (lockoutUntil && now < lockoutUntil) {
          const remainingMinutes = Math.ceil((lockoutUntil - now) / 60000);
          toast.error(`Account locked due to too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`);
          return;
        }
      }

      try {
        const response = await loginApi({ email, password });
        
        console.log("Login API Response:", response);
        console.log("Response Data:", response.data);
        
        // Check if response is successful
        if (response && response.data && response.data.success === true) {
          const { token, user } = response.data;

          console.log("Login successful! Token:", token ? "Received" : "Missing");
          console.log("User:", user);

          // Reset failed attempts on successful login
          localStorage.removeItem('loginLockout');

          // Save token and user
          if (token) {
            localStorage.setItem("token", token);
          }
          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
          }

          // Clear form fields
          setEmail("");
          setPassword("");

          toast.success("Login Successful! Redirecting to dashboard...");
          
          // Navigate to dashboard/home page
          setTimeout(() => {
            navigate("/");
            window.location.reload();
          }, 1000);
        } else {
          console.error("Login response not successful:", response);
          throw new Error(response?.data?.message || "Login failed - invalid response");
        }
      } catch (error) {
        console.error("Login Error Details:", error);
        console.error("Error Response:", error.response?.data);
        console.error("Error Status:", error.response?.status);
        
        // Only increment failed attempts if it's actually a failed login (not network error)
        if (error.response && error.response.status === 400) {
          // Check if user just registered - don't count first attempt as failure
          const justRegistered = sessionStorage.getItem('justRegistered');
          const isFirstAttemptAfterRegistration = justRegistered === 'true';
          
          // Handle failed login attempts
          const lockoutData = localStorage.getItem('loginLockout');
          let failedAttempts = 0;
          
          if (lockoutData) {
            try {
              const data = JSON.parse(lockoutData);
              failedAttempts = data.failedAttempts || 0;
              
              // Check if user is already locked out
              if (data.lockoutUntil && Date.now() < data.lockoutUntil) {
                const remainingMinutes = Math.ceil((data.lockoutUntil - Date.now()) / 60000);
                toast.error(`Account locked. Please try again in ${remainingMinutes} minute(s).`);
                setIsLockedOut(true);
                setLockoutTimeRemaining(Math.ceil((data.lockoutUntil - Date.now()) / 1000));
                return;
              }
            } catch (e) {
              // If lockout data is corrupted, reset it
              localStorage.removeItem('loginLockout');
              failedAttempts = 0;
            }
          }
          
          // Only increment if it's NOT the first attempt after registration
          if (!isFirstAttemptAfterRegistration) {
            failedAttempts += 1;
          } else {
            // Clear the flag after first attempt (so next failure will count)
            sessionStorage.removeItem('justRegistered');
            console.log("First login attempt after registration - not counting as failure");
          }
          
          // If 10 or more failed attempts, lock out for 5 minutes
          if (failedAttempts >= 10) {
            const lockoutUntil = Date.now() + (5 * 60 * 1000); // 5 minutes
            localStorage.setItem('loginLockout', JSON.stringify({
              failedAttempts: failedAttempts,
              lockoutUntil: lockoutUntil
            }));
            setIsLockedOut(true);
            setLockoutTimeRemaining(300); // 5 minutes in seconds
            toast.error("Too many failed login attempts. Your account has been locked for 5 minutes.");
          } else if (failedAttempts > 0) {
            // Store updated failed attempts count (only if we incremented)
            localStorage.setItem('loginLockout', JSON.stringify({
              failedAttempts: failedAttempts
            }));
            
            const remainingAttempts = 10 - failedAttempts;
            toast.error(`${error.response?.data?.message || "Invalid email or password"} ${remainingAttempts > 0 ? `(${remainingAttempts} attempt(s) remaining before lockout)` : ''}`);
          } else {
            // First attempt after registration - just show error without brute force warning
            toast.error(error.response?.data?.message || "Invalid email or password");
          }
        } else {
          // Network or other errors - don't count as failed login attempt
          toast.error(error.response?.data?.message || "Network error. Please check your connection and try again.");
        }

      }

      setName("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mt-10 mb-2">
        <p className="text-3xl prata-regular">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {/* Lockout Message - Only shown during Login */}
      {currentState === "Login" && isLockedOut && lockoutTimeRemaining > 0 && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded text-center">
          <p className="text-sm text-red-600 font-medium">
            Account locked due to too many failed login attempts.
          </p>
          <p className="text-xs text-red-500 mt-1">
            Please try again in {Math.floor(lockoutTimeRemaining / 60)}:{(lockoutTimeRemaining % 60).toString().padStart(2, '0')}
          </p>
        </div>
      )}

      {currentState === "Sign Up" && (
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Enter your name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      <div className="w-full">
        <input
          type="email"
          className={`w-full px-3 py-2 border ${currentState === "Sign Up" && emailError ? "border-red-500" : "border-gray-800"}`}
          placeholder="Enter your email"
          required
          value={email}
          onChange={handleEmailChange}
        />
        {currentState === "Sign Up" && emailError && (
          <p className="text-red-500 text-xs mt-1">{emailError}</p>
        )}
      </div>

      <div className="relative w-full">
          <input
          type={showPassword ? "text" : "password"}
          className="w-full px-3 py-2 pr-10 border border-gray-800"
          placeholder="Enter your password"
          required
          value={password}
          onChange={handlePasswordChange}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Password Strength Indicator - Only for Sign Up */}
      {currentState === "Sign Up" && password && passwordStrength.label && (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  passwordStrength.color === "red" ? "bg-red-500" :
                  passwordStrength.color === "yellow" ? "bg-yellow-500" :
                  "bg-green-500"
                }`}
                style={{ width: `${(passwordStrength.level / 3) * 100}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${
              passwordStrength.color === "red" ? "text-red-500" :
              passwordStrength.color === "yellow" ? "text-yellow-600" :
              "text-green-600"
            }`}>
              {passwordStrength.label}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Use 8+ characters with a mix of letters, numbers & symbols
          </p>
        </div>
      )}

      {/* Confirm Password Field - Only for Sign Up */}
      {currentState === "Sign Up" && (
        <div className="relative w-full">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className={`w-full px-3 py-2 pr-10 border ${confirmPasswordError ? "border-red-500" : "border-gray-800"}`}
            placeholder="Confirm your password"
            required
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
          {confirmPasswordError && (
            <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>
          )}
        </div>
      )}

      <div className="flex justify-between w-full text-sm mt-[-8px]">
        {currentState === "Login" ? (
          <>
            <Link to="/forgot-password" className="cursor-pointer hover:underline">
              Forgot your password?
            </Link>
            <p
              onClick={() => setCurrentState("Sign Up")}
              className="cursor-pointer hover:underline"
            >
              Create a new account
            </p>
          </>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer hover:underline ml-auto"
          >
            Login here
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={currentState === "Login" && isLockedOut}
        className={`px-8 py-2 mt-4 font-light text-white bg-black ${currentState === "Login" && isLockedOut ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;