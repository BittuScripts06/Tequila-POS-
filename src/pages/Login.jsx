import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { fetchUserProfile } from "../api/profile";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEVICE_ID = import.meta.env.VITE_DEFAULT_DEVICE_ID;
const DEFAULT_RESTAURANT_ID = import.meta.env.VITE_TEST_RESTAURANT_ID || "";

const Login = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [loginMode, setLoginMode] = useState("passcode");
  const [authStep, setAuthStep] = useState("login");
  // login | forgot | reset

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [passcode, setPasscode] = useState("");

  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------------- REMEMBER ME ----------------
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("rememberedUser"));
    if (saved) {
      setLoginMode(saved.loginMode || "passcode");
      setEmail(saved.email || "");
      setPassword(saved.password || "");
      setPasscode(saved.passcode || "");
      setRemember(true);
    }
  }, []);

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload =
        loginMode === "passcode"
          ? {
              restaurant_id: Number(DEFAULT_RESTAURANT_ID),
              passcode,
              keep_logged_in: remember,
              device_id: DEVICE_ID,
            }
          : {
              restaurant_id: Number(DEFAULT_RESTAURANT_ID),
              email,
              password,
              keep_logged_in: remember,
              device_id: DEVICE_ID,
            };

      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("logingsuccessfull", data);
      if (!data.success || !data.data?.token) {
        throw new Error(data.message || "Login failed");
      }

      const token = data.data.token.includes("|")
        ? data.data.token.split("|")[1]
        : data.data.token;

      localStorage.setItem("authToken", token);

      remember
        ? localStorage.setItem(
            "rememberedUser",
            JSON.stringify({ loginMode, email, password, passcode }),
          )
        : localStorage.removeItem("rememberedUser");

      toast.success("Login successful!");

      const profile = await fetchUserProfile(token);

      if (profile?.success) {
        localStorage.setItem("user", JSON.stringify(profile.data));

        // 🔥 POS rule: shift decision happens in ShiftClock only
        navigate("/shiftclock", { replace: true });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FORGOT PASSWORD ----------------
  const handleForgotPassword = async () => {
    if (!email) return toast.error("Email required");

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(data.message);
      setAuthStep("reset");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESET PASSWORD ----------------
  const handleResetPassword = async () => {
    if (!otp || !password || !confirmPassword) {
      return toast.error("All fields required");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Password reset successful");
      setAuthStep("login");
      setPassword("");
      setConfirmPassword("");
      setOtp("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Tequila POS Login
        </h2>

        {/* MODE SWITCH */}
        {authStep === "login" && (
          <div className="flex justify-center mb-6 gap-4">
            {["passcode", "email"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setLoginMode(mode)}
                className={`px-4 py-2 rounded-xl ${
                  loginMode === mode ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {mode === "passcode" ? "Passcode Login" : "Email Login"}
              </button>
            ))}
          </div>
        )}

        {/* ---------------- LOGIN / FORGOT / RESET ---------------- */}
        <AnimatePresence mode="wait">
          {authStep === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <AnimatePresence mode="wait">
                {loginMode === "passcode" ? (
                  /* -------- PASSCODE LOGIN -------- */
                  <motion.div
                    key="passcode"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter Passcode"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </motion.div>
                ) : (
                  /* -------- EMAIL LOGIN -------- */
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email"
                      className="w-full px-4 py-2 border rounded-lg"
                    />

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>

                    {/* 🔹 FORGOT PASSWORD LINK */}
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setAuthStep("forgot")}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* -------- REMEMBER ME -------- */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                <label>Remember Me</label>
              </div>

              {/* -------- LOGIN BUTTON -------- */}
              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg transition hover:bg-blue-700"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {/* FORGOT */}
          {authStep === "forgot" && (
            <div key="forgot" className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter registered email"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
              >
                Send Reset Link
              </button>

              <button
                onClick={() => setAuthStep("login")}
                className="text-sm text-gray-500"
              >
                Back to login
              </button>
            </div>
          )}

          {/* RESET */}
          {authStep === "reset" && (
            <div key="reset" className="space-y-4">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
              >
                Reset Password
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
