import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ShiftClock from "./components/ShiftClock";
import FloorsList from "./pages/FloorsList";
import TablesList from "./pages/TablesList";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/dashboard/:tableId" element={<Dashboard />} />

        <Route path="/shiftclock" element={<ShiftClock />} />

        <Route path="/pos" element={<FloorsList />} />

        <Route path="/floors/:floorId/tables" element={<TablesList />} />

        {/*  FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={1500}
        theme="colored"
        toastClassName="z-[99999]"
      />
    </>
  );
}

export default App;
