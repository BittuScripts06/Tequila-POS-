import { useEffect, useState } from "react";
import { getFloors } from "../api/floorsApi";
import { useNavigate } from "react-router-dom";
import { createFloors } from "../api/createFloors";
import { toast } from "react-toastify";
import { deleteFloor } from "../api/deleteFloor";
import { Trash2, Pencil } from "lucide-react";
import { updateFloor } from "../api/updateFloor";
import { updateFloorStatus } from "../api/updateFloorStatus";

import { FLOOR_STATUS, FLOOR_STATUS_STYLES } from "../constants/floorConstants";

const FloorsList = () => {
  const [floors, setFloors] = useState([]);

  const [open, setOpen] = useState(false);
  const [floorName, setFloorName] = useState("");

  const [isEdit, setIsEdit] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [bgColor, setBgColor] = useState("#E4FF30");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    getFloors(token).then((res) => {
      console.log("FloorsResponse", res);
      if (res.success) {
        const sorted = [...res.data].sort((a, b) => a.sequence - b.sequence);

        setFloors(sorted);
      }
    });
  }, []);

  const openEditModal = (e, floor) => {
    e.stopPropagation();

    setIsEdit(true);
    setSelectedFloor(floor);
    setFloorName(floor.name);
    setBgColor(floor.bg_color);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setIsEdit(false);
    setSelectedFloor(null);
    setFloorName("");
    setBgColor("#E4FF30");
  };

  const handleUpdateFloor = async () => {
    if (!floorName.trim()) {
      toast.error("Floor name is required");
      return;
    }

    const token = localStorage.getItem("authToken");

    const payload = {
      name: floorName.trim(),
      sequence: selectedFloor.sequence,
      bg_color: bgColor,
    };

    const res = await updateFloor(token, selectedFloor.id, payload);

    if (res.success) {
      toast.success(res.message);

      // 🔥 update local state
      setFloors((prev) =>
        prev.map((f) => (f.id === selectedFloor.id ? res.data : f)),
      );

      closeModal();
    } else {
      toast.error(res.message || "Update failed");
    }
  };

  const handleCreateFloor = async () => {
    if (!floorName.trim()) {
      toast.error("Floor name is required");
      return;
    }

    const token = localStorage.getItem("authToken");

    const payload = {
      name: floorName.trim(),
      bg_color: "#E4FF30",
      sequence: floors.length + 1,
    };

    const res = await createFloors(token, payload);

    if (res.success) {
      toast.success(res.message);

      setFloors((prev) =>
        [...prev, res.data].sort((a, b) => a.sequence - b.sequence),
      );

      setFloorName("");
      setOpen(false);
    } else {
      if (res.data?.name?.length) {
        toast.error(res.data.name[0]);
      } else {
        toast.error(res.message || "Floor create failed");
      }
    }
  };

  const handleDeleteFloor = async (e, floorId) => {
    e.stopPropagation(); //  card click (navigation) rokne ke liye

    const confirmDelete = window.confirm(
      "Are you sure? This will delete floor and all tables/chairs.",
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("authToken");

    const res = await deleteFloor(token, floorId);

    if (res.success) {
      toast.success("Floor deleted successfully");

      // 🔥 UI se floor remove
      setFloors((prev) => prev.filter((f) => f.id !== floorId));
    } else {
      toast.error(res.message || "Failed to delete floor");
    }
  };

  const handleStatusChange = async (e, floor) => {
    e.stopPropagation(); // 🚫 prevent navigation

    const newStatus = Number(e.target.value);
    const token = localStorage.getItem("authToken");

    const res = await updateFloorStatus(token, floor.id, newStatus);

    if (res.success) {
      // toast.success("Floor status updated");

      // 🔥 update UI locally (NO refetch)
      setFloors((prev) =>
        prev.map((f) => (f.id === floor.id ? { ...f, status: newStatus } : f)),
      );
    } else {
      toast.error(res.message || "Failed to update status");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Floors</h1>
          <p className="text-sm text-slate-500">
            Manage your restaurant floors
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            Total: <span className="font-medium">{floors.length}</span>
          </span>

          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
          >
            + Add Floor
          </button>
        </div>
      </div>

      {/* Create Floor Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {isEdit ? "Edit Floor" : "Create New Floor"}
            </h2>

            <input
              type="text"
              placeholder="Floor name"
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 mb-4"
            />

            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer mb-5"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="text-sm px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={isEdit ? handleUpdateFloor : handleCreateFloor}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {isEdit ? "Update Floor" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {floors.map((floor) => (
          <div
            key={floor.id}
            onClick={() => {
              if (floor.status === 3 || floor.status === 4) {
                toast.info("This floor is not available");
                return;
              }
              navigate(`/floors/${floor.id}/tables`);
            }}
            className="group relative cursor-pointer bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <button
              onClick={(e) => openEditModal(e, floor)}
              className="absolute top-3 right-14 z-10 hidden group-hover:flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
              title="Edit Floor"
            >
              <Pencil size={16} />
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => handleDeleteFloor(e, floor.id)}
              className="absolute top-3 right-3 z-10 hidden group-hover:flex items-center justify-center w-9 h-9 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
              title="Delete Floor"
            >
              <Trash2 size={16} />
            </button>

            {/* Image */}
            <div
              className="h-36 bg-cover bg-center"
              style={{
                backgroundImage: `url(${floor.bg_image})`,
              }}
            />

            {/* Content */}
            <div className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-800 capitalize">
                  {floor.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Sequence #{floor.sequence}
                </p>
              </div>

              <div
                className="w-9 h-9 rounded-full border shadow-sm"
                style={{ backgroundColor: floor.bg_color }}
                title={floor.bg_color}
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-1 text-xs rounded ${FLOOR_STATUS_STYLES[floor.status]}`}
              >
                {FLOOR_STATUS[floor.status]}
              </span>

              <select
                value={floor.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleStatusChange(e, floor)}
                className="border rounded px-2 py-1 text-xs"
              >
                {Object.entries(FLOOR_STATUS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorsList;
