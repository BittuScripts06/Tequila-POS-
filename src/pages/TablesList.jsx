// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import { getTables } from "../api/tablesApi";

// const TablesList = () => {
//   const { floorId } = useParams();
//   console.log("floorid", floorId);
//   const navigate = useNavigate();

//   const [tables, setTables] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//   const fetchTables = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) return;

//       const data = await getTables(floorId, token);
//       console.log("Table Response>>", data);

//       if (!data.success) {
//         toast.error(data.message || "Failed to load tables");
//         return;
//       }

//       setTables(data.data);
//     } catch (err) {
//       toast.error("Network error while loading tables");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchTables();
// }, [floorId]);

//   const handleTableClick = (table) => {
//     console.log("table", table);
//     if (table.status !== "Available") {
//       toast.warning(`Table "${table.name}" is not available`, {
//         position: "top-center",
//       });
//       return;
//     }

//     // Available table → take order
//     navigate(`/dashboard/${table.id}`);
//   };

//   if (loading) {
//     return <p className="p-4">Loading tables...</p>;
//   }

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Tables · Floor #{floorId}</h1>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {tables.map((table) => {
//           const isOccupied = table.status === "Occupied";
//           const isReserved = table.status === "Reserved";

//           return (
//             <div
//               onClick={() => handleTableClick(table)}
//               key={table.id}
//               className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200
//         ${
//           isOccupied
//             ? "bg-red-50 border-2 border-red-500 shadow-lg"
//             : isReserved
//               ? "bg-yellow-50 border-2 border-yellow-400"
//               : "bg-green-50 border border-green-400 hover:shadow-md"
//         }
//       `}
//             >
//               {/* STATUS BADGE */}
//               <span
//                 className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded font-semibold
//           ${
//             isOccupied
//               ? "bg-red-500 text-white"
//               : isReserved
//                 ? "bg-yellow-500 text-white"
//                 : "bg-green-500 text-white"
//           }
//         `}
//               >
//                 {table.status}
//               </span>

//               {/* TABLE NAME */}
//               <h2 className="font-bold text-lg mb-1">{table.name}</h2>

//               {/* CHAIRS */}
//               <div className="flex flex-wrap gap-2 justify-center mt-3">
//                 {table.chairs?.map((chair, index) => (
//                   <div
//                     key={chair.id}
//                     className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
//               ${
//                 chair.status === "vacant"
//                   ? "bg-green-400"
//                   : chair.status === "occupied"
//                     ? "bg-red-400"
//                     : "bg-yellow-400"
//               }
//             `}
//                   >
//                     {index + 1}
//                   </div>
//                 ))}
//               </div>

//               {/* CAPACITY */}
//               <p className="text-sm text-gray-700 mt-3 text-center">
//                 Capacity: {table.seating_capacity}
//               </p>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default TablesList;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getTables } from "../api/tablesApi";
import { getFloorById } from "../api/getFloorById";
import { createTable, deleteTable } from "../api/tablesApi";
const TablesList = () => {
  const { floorId } = useParams();
  const navigate = useNavigate();

  const [floor, setFloor] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [tableName, setTableName] = useState("");
  const [bgColor, setBgColor] = useState("#74658b");
  const [shape, setShape] = useState("square");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Session expired");
          return;
        }

        // 1️⃣ Fetch floor details
        const floorRes = await getFloorById(floorId);
        if (!floorRes.success) {
          toast.error("Failed to load floor details");
          return;
        }
        setFloor(floorRes.data);

        // 2️⃣ Fetch tables for this floor
        const tablesRes = await getTables(floorId, token);
        if (!tablesRes.success) {
          toast.error(tablesRes.message || "Failed to load tables");
          return;
        }
        setTables(tablesRes.data);
      } catch (error) {
        toast.error("Network error while loading floor data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [floorId]);

  const handleCreateTable = async () => {
    if (!tableName.trim()) {
      toast.error("Table name is required");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const payload = {
        floor_id: Number(floorId),
        type: 1,
        table_no: tableName,
        bg_color: bgColor,
        shape,
        seating_capacity: 6,
        length: "100",
        width: "100",
        position_x: "50",
        position_y: "50",
        rotation: "0",
      };

      const res = await createTable(token, payload);

      if (!res.success) {
        toast.error("Failed to create table");
        return;
      }

      toast.success("Table created");

      // ⭐ UI instantly update
      setTables((prev) => [...prev, res.data]);

      setOpenModal(false);
      setTableName("");
    } catch (err) {
      toast.error("Error creating table");
    }
  };

  const handleDeleteTable = async (e, tableId) => {
    e.stopPropagation(); // 👈 very important

    console.log("tableID", tableId);
    if (!window.confirm("Delete this table?")) return;

    try {
      const token = localStorage.getItem("authToken");
      console.log(token);
      const res = await deleteTable(token, tableId);

      if (!res.success) {
        toast.error("Delete failed");
        return;
      }

      toast.success("Table deleted");

      // ⭐ remove from UI
      setTables((prev) => prev.filter((t) => t.id !== tableId));
    } catch (err) {
      toast.error("Error deleting table");
    }
  };

  const handleTableClick = (table) => {
    if (table.status !== "Available") {
      toast.warning(`Table "${table.name}" is not available`, {
        position: "top-center",
      });
      return;
    }

    navigate(`/dashboard/${table.id}`);
  };

  if (loading) {
    return <p className="p-6 text-sm text-slate-500">Loading tables...</p>;
  }

  return (
    <div className="p-6">
      {/* FLOOR HEADER */}
      {floor && (
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800">
            {floor.name}
          </h1>

          <p className="text-sm text-slate-500">
            Floor sequence #{floor.sequence}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <div
              className="h-2 w-24 rounded-full"
              style={{ backgroundColor: floor.bg_color }}
            />
          </div>
        </div>
      )}

      <button
        onClick={() => setOpenModal(true)}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
      >
        + Add Table
      </button>

      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Create Table</h2>

            <input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Table name"
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="square">Square</option>
              <option value="circle">Circle</option>
            </select>

            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-10 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setOpenModal(false)}>Cancel</button>
              <button
                onClick={handleCreateTable}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLES GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {tables.map((table) => {
          const isOccupied = table.status === "Occupied";
          const isReserved = table.status === "Reserved";

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200
                ${
                  isOccupied
                    ? "bg-red-50 border-2 border-red-500 shadow-lg"
                    : isReserved
                      ? "bg-yellow-50 border-2 border-yellow-400"
                      : "bg-green-50 border border-green-400 hover:shadow-md"
                }
              `}
            >
              {/* STATUS BADGE */}
              <span
                className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded font-semibold
                  ${
                    isOccupied
                      ? "bg-red-500 text-white"
                      : isReserved
                        ? "bg-yellow-500 text-white"
                        : "bg-green-500 text-white"
                  }
                `}
              >
                {table.status}
              </span>

              {/* TABLE NAME */}
              <h2 className="font-semibold text-lg mb-1">{table.name}</h2>

              {/* CHAIRS */}
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {table.chairs?.map((chair, index) => (
                  <div
                    key={chair.id}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      ${
                        chair.status === "vacant"
                          ? "bg-green-400"
                          : chair.status === "occupied"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                      }
                    `}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>

              {/* CAPACITY */}
              <p className="text-sm text-gray-700 mt-3 text-center">
                Capacity: {table.seating_capacity}
              </p>

              <button
                onClick={(e) => handleDeleteTable(e, table.id)}
                className="absolute bottom-2 right-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TablesList;
