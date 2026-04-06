// import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import { Pause, Play, Utensils, CheckCircle, LogOut, X } from "lucide-react";

// const BASE_URL = "https://tequilapos.net/api";

// const ShiftControls = ({ open, onClose }) => {
//   const [shiftStatus, setShiftStatus] = useState(null);
//   const token = localStorage.getItem("authToken");

//   // Load shift status when modal opens
//   useEffect(() => {
//     if (open) {
//       try {
//         const raw = localStorage.getItem("shiftStatus");
//         setShiftStatus(raw ? JSON.parse(raw) : { clockOut: true });
//       } catch {
//         setShiftStatus({ clockOut: true });
//       }
//     }
//   }, [open]);

//   if (!open) return null;

//   /* -----------------------
//      Button Visibility Logic
//      ----------------------- */

//   const isClockedIn = shiftStatus?.clockIn === true;

//   const canStartBreak =
//     isClockedIn && !shiftStatus?.startBreak && !shiftStatus?.startMealBreak;

//   const canEndBreak = shiftStatus?.startBreak && !shiftStatus?.endBreak;

//   const canStartMeal =
//     isClockedIn && !shiftStatus?.startMealBreak && !shiftStatus?.startBreak;

//   const canEndMeal = shiftStatus?.startMealBreak && !shiftStatus?.endMealBreak;

//   const canClockOut =
//     isClockedIn &&
//     !shiftStatus?.clockOut &&
//     !shiftStatus?.startBreak &&
//     !shiftStatus?.startMealBreak;

//   /* -----------------------
//      API Handler
//      ----------------------- */

//   const handleAction = async (action) => {
//     try {
//       const res = await fetch(`${BASE_URL}/shiftclock`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           action,
//           timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       // 🔥 Save + Notify Dashboard
//       localStorage.setItem("shiftStatus", JSON.stringify(data.shiftStatus));
//       window.dispatchEvent(new Event("shift-status-updated"));

//       toast.success(data.message);
//       onClose();
//     } catch (err) {
//       toast.error(err.message || "Shift action failed");
//     }
//   };

//   /* -----------------------
//      UI
//      ----------------------- */

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 relative">
//         {/* Close */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
//         >
//           <X size={20} />
//         </button>

//         <h2
//           className="text-xl font-semibold text-center mb-6"
//           onClick={() => setOpenShift(true)}
//         >
//           Shift Controls
//         </h2>

//         <div className="flex flex-col gap-3">
//           {canStartBreak && (
//             <button
//               onClick={() => handleAction("start_break")}
//               className="flex items-center justify-center gap-2 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600"
//             >
//               <Pause size={18} /> Start Break
//             </button>
//           )}

//           {canEndBreak && (
//             <button
//               onClick={() => handleAction("end_break")}
//               className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
//             >
//               <Play size={18} /> End Break
//             </button>
//           )}

//           {canStartMeal && (
//             <button
//               onClick={() => handleAction("start_meal_break")}
//               className="flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600"
//             >
//               <Utensils size={18} /> Start Meal Break
//             </button>
//           )}

//           {canEndMeal && (
//             <button
//               onClick={() => handleAction("end_meal_break")}
//               className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
//             >
//               <CheckCircle size={18} /> End Meal Break
//             </button>
//           )}

//           {canClockOut && (
//             <button
//               onClick={() => handleAction("clock_out")}
//               className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
//             >
//               <LogOut size={18} /> Clock Out
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShiftControls;




// src/components/ShiftControls.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Coffee,
  Utensils,
  LogOut,
  X,
  PauseCircle,
  PlayCircle,
} from "lucide-react";

const BASE_URL = "https://tequilapos.net/api";

const ShiftControls = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // const updateShiftStatus = (status) => {
  //   localStorage.setItem(
  //     "user",
  //     JSON.stringify({ ...user, shiftStatus: status })
  //   );
  //   window.dispatchEvent(new Event("storage"));
  // };

  const handleAction = async (action) => {
    if (!user?.roles?.length) {
      toast.error("No role assigned");
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
          action,
          role_id: user.roles[0].id, // ✅ correct
          timestamp: new Date().toISOString().slice(0, 19).replace("T", " "), // ✅ inline
        }),
      });

      const data = await res.json();
      console.log("action>>>", data);

      if (data?.error) {
        toast.error(Object.values(data.error)[0]);
        return;
      }

      if (data?.status === "success") {
        const latestUser = JSON.parse(localStorage.getItem("user")) || {};

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...latestUser,
            shiftStatus: data.shiftStatus, // backend truth
          }),
        );

        window.dispatchEvent(new Event("auth-user-updated"));

        if (action === "clock_out") {
          toast.success("Shift Ended");
          navigate("/shiftclock");
          return;
        }

        toast.success(data.message);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[380px] rounded-2xl shadow-2xl p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Shift Controls
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAction("start_break")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white"
          >
            <PauseCircle size={18} /> Start Break
          </button>

          <button
            onClick={() => handleAction("end_break")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white"
          >
            <PlayCircle size={18} /> End Break
          </button>

          <button
            onClick={() => handleAction("start_meal_break")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-500 text-white"
          >
            <Utensils size={18} /> Meal Break
          </button>

          <button
            onClick={() => handleAction("end_meal_break")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white"
          >
            <Coffee size={18} /> End Meal
          </button>
        </div>

        <div className="my-5 border-t" />

        <button
          onClick={() => handleAction("clock_out")}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white"
        >
          <LogOut size={18} /> Clock Out
        </button>
      </div>
    </div>
  );
};

export default ShiftControls;