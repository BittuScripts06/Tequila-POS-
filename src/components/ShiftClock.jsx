import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LogIn, Loader2 } from "lucide-react";
import UserInfo from "./UserInfo";

import { getShiftState } from "../utils/splitLogic/shiftlogic/shiftStatus";
const BASE_URL = "https://tequilapos.net/api";

const ShiftClock = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("authToken");

  /* ===========================
     🔁 SYNC USER ON MOUNT
     =========================== */
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  /* ===========================
      REDIRECT IF ACTIVE SHIFT
     =========================== */
  useEffect(() => {
    if (!user?.shiftStatus) return;

    const state = getShiftState(user.shiftStatus);

    if (state !== "CLOCKED_OUT") {
      navigate("/pos", { replace: true });
    }
  }, [user, navigate]);

  /* ===========================
     🚀 CLOCK IN HANDLER
     =========================== */
  const handleClockIn = async () => {
    if (!user?.roles?.length) {
      toast.error("No role assigned to this user");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/shiftclock`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "clock_in",
          role_id: user.roles[0].id,
          timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
        }),
      });

      const data = await res.json();
      console.log("clockInResp>>", data);

      if (data?.error) {
        toast.error(Object.values(data.error)[0]);
        return;
      }

      /* ===============================
       ✅ SUCCESS CLOCK IN
       =============================== */
      if (data?.status === "success") {
        const updatedUser = {
          ...user,
          shiftStatus: data.shiftStatus,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("auth-user-updated"));

        setUser(updatedUser);

        toast.success(data.message);
        navigate("/pos", { replace: true });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-700">
      <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center">
        <UserInfo />

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Employee Shift Clock
        </h1>
        <p className="text-gray-500 mb-8">Start your shift to access POS</p>

        <button
          onClick={handleClockIn}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-lg font-semibold transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={22} />
              Processing...
            </>
          ) : (
            <>
              <LogIn size={22} />
              Clock In
            </>
          )}
        </button>

        <p className="text-sm text-gray-400 mt-6">
          Please clock in before taking orders
        </p>
      </div>
    </div>
  );
};

export default ShiftClock;
