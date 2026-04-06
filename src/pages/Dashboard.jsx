// import React, { useState, useEffect, useMemo } from "react";

// import { useNavigate, useParams } from "react-router-dom";

// import { Timer } from "lucide-react";
// import { getShiftState } from "../utils/splitLogic/shiftlogic/shiftStatus";

// import { toast } from "react-toastify";
// import SplitOrderModal from "../components/modals/SplitOrderModal";
// // import { getShiftState } from "../utils/shiftlogic/shiftStatus.js";

// // Components
// import CategoriesList from "../components/CategoriesList";
// import ItemsList from "../components/ItemsList";
// import ModifierModal from "../components/modals/ModifierModal";
// import PaymentMethods from "../components/modals/PaymentMethods";
// import OrderSummary from "../components/OrderSummary";
// import ShiftControls from "../components/ShiftControls";
// import FetchTax from "../components/FetchTax";

// // Custom Hooks
// import { useAuth } from "../hooks/useAuth";
// import { useCategories } from "../hooks/useCategories";
// import { useItems } from "../hooks/useItems";
// import { useModifiers } from "../hooks/useModifiers";
// import { useOrder } from "../hooks/useOrder";

// // API Base URL
// const BASE_URL = "https://tequilapos.net/api";

// const Dashboard = () => {
//   const { tableId } = useParams();
//   const [openShift, setOpenShift] = useState(false);
//   const [shiftState, setShiftState] = useState("CLOCKED_OUT");

//   const [showAllItems, setShowAllItems] = useState(false);
//   const [showAllCategories, setShowAllCategories] = useState(false);
//   const [splitOrders, setSplitOrders] = useState([]);
//   const [showSplitModal, setShowSplitModal] = useState(false);

//   const navigate = useNavigate();

//   const [taxRate, setTaxRate] = useState(0);

//   // --- AUTH ---
//   const { token, userState, logout, getHeaders } = useAuth();

// useEffect(() => {
//   const loadShiftStatus = () => {
//     try {
//       const raw = localStorage.getItem("shiftStatus");

//       if (!raw) {
//         // ❗ No data → assume clocked out
//         setShiftState("CLOCKED_OUT");
//         return;
//       }

//       const parsed = JSON.parse(raw);
//       setShiftState(getShiftState(parsed));
//     } catch (err) {
//       // ❗ Corrupt data → fail safe
//       setShiftState("CLOCKED_OUT");
//     }
//   };

//   loadShiftStatus();
//   window.addEventListener("shift-status-updated", loadShiftStatus);

//   return () =>
//     window.removeEventListener("shift-status-updated", loadShiftStatus);
// }, []);

//   const resetOrderState = () => {
//     setOrderItems([]);
//     setShowModal(false);
//     setModalItem(null);
//     setModalQty(1);
//     setModalSelectedMods([]);

//     setShowPaymentModal(false);
//     navigate("/floors", { replace: true });
//   };

//   // Logout
//   const handleLogout = async () => {
//     await logout();
//     toast.success("Logout Successful!", { position: "top-center" });
//     navigate("/");
//   };

//   // --- CATEGORIES ---
//   const {
//     categories,
//     loadingCategories,
//     error: categoriesError,
//   } = useCategories(BASE_URL, token);

//   // --- ITEMS ---
//   const { items, loadingItems, selectedCategory, fetchItems } = useItems(
//     BASE_URL,
//     token,
//   );

//   // first category  selected
//   useEffect(() => {
//     if (categories.length > 0 && !selectedCategory) {
//       const firstCategoryId = categories[0].id;
//       fetchItems(firstCategoryId);
//     }
//   }, [categories, selectedCategory, fetchItems]);

//   // --- MODIFIERS ---
//   const { modalModifiers, modalModifiersLoading, fetchModifiers } =
//     useModifiers(BASE_URL, token);

//   const [showModal, setShowModal] = useState(false);
//   const [modalItem, setModalItem] = useState(null);
//   const [modalQty, setModalQty] = useState(1);
//   const [modalSelectedMods, setModalSelectedMods] = useState([]);

//   const openAddModal = async (item) => {
//     console.log("items", item);
//     setModalItem(item);
//     setModalQty(1);
//     setModalSelectedMods([]);
//     setShowModal(true);

//     await fetchModifiers(item.id);
//   };

//   const toggleModalModifier = (id) =>
//     setModalSelectedMods((prev) =>
//       prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
//     );

//   const getModifierById = (id) =>
//     modalModifiers.find((m) => String(m.id) === String(id));

//   // --- ORDER ---
//   const {
//     orderItems,
//     addToOrderWithModifiers,
//     updateOrderQuantity,
//     removeOrderItem,
//     setOrderItems,
//   } = useOrder();

//   const { grandTotal } = useMemo(() => {
//     const itemsTotal = orderItems.reduce(
//       (sum, item) => sum + (item.basePrice || 0) * item.quantity,
//       0,
//     );

//     return {
//       grandTotal: +(itemsTotal + itemsTotal * taxRate).toFixed(2),
//     };
//   }, [orderItems, taxRate]);

//   const handleAddToOrder = () => {
//     const selectedMods = modalSelectedMods.map(getModifierById).filter(Boolean);
//     addToOrderWithModifiers(modalItem, selectedMods, modalQty);
//     setShowModal(false);
//     setModalItem(null);
//   };

//   // --- PAYMENT MODAL ---
//   const [showPaymentModal, setShowPaymentModal] = useState(false);

//   // --- LOADING STATE ---
//   if (loadingCategories) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-gray-700 text-lg">Loading categories...</p>
//       </div>
//     );
//   }

//   const visibleItems = showAllItems ? items : items.slice(0, 8);
//   const visibleCategories = showAllCategories
//     ? categories
//     : categories.slice(0, 8);

//   // UI
//   return (
//     <div className="h-screen w-full flex bg-gray-100 overflow-hidden relative">
//       {/* TAX  */}
//       <FetchTax
//         token={token}
//         setTaxRate={setTaxRate}
//         BASE_URL={BASE_URL}
//         getHeaders={getHeaders}
//       />

//       <ShiftControls open={openShift} onClose={() => setOpenShift(false)} />

//       <button
//         onClick={() => setOpenShift(true)}
//         className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
//       >
//         <Timer size={16} />
//         Shift Control
//       </button>

//       {/* LOGOUT BUTTON */}
//       <button
//         onClick={handleLogout}
//         className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
//       >
//         Logout
//       </button>

//       {/* ORDER SUMMARY */}
//       <OrderSummary
//         orderItems={splitOrders.length ? splitOrders[0] : orderItems}
//         taxRate={taxRate}
//         updateOrderQuantity={updateOrderQuantity}
//         removeOrderItem={removeOrderItem}
//         onSplitOrder={() => setShowSplitModal(true)}
//         onPlaceOrder={() => setShowPaymentModal(true)}
//       />

//       {tableId && (
//         <div className="fixed top-5 lg:left-151 left-120 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded shadow z-50">
//           Taking Order for Table #{tableId}
//         </div>
//       )}

//       {/* MAIN CONTENT */}
//       <main className="flex-1 p-8 overflow-y-auto">
//         {categoriesError && (
//           <div className="text-red-600 bg-red-50 p-2 rounded mb-4">
//             {categoriesError}
//           </div>
//         )}

//         <ItemsList
//           loadingItems={loadingItems}
//           items={items}
//           visibleItems={visibleItems}
//           showAllItems={showAllItems}
//           setShowAllItems={setShowAllItems}
//           openAddModal={openAddModal}
//         />

//         <CategoriesList
//           categories={categories}
//           visibleCategories={visibleCategories}
//           selectedCategory={selectedCategory}
//           fetchItemsByCategory={fetchItems}
//           showAllCategories={showAllCategories}
//           setShowAllCategories={setShowAllCategories}
//         />
//       </main>

//       {/* MODIFIER MODAL */}
//       <ModifierModal
//         show={showModal}
//         onClose={() => setShowModal(false)}
//         item={modalItem}
//         qty={modalQty}
//         setQty={setModalQty}
//         modifiers={modalModifiers}
//         loading={modalModifiersLoading}
//         selectedMods={modalSelectedMods}
//         toggleMod={toggleModalModifier}
//         addToOrder={handleAddToOrder}
//       />

//       {/* SPLIT ORDER MODAL */}
//       {showSplitModal && (
//         <SplitOrderModal
//           orderItems={orderItems}
//           onClose={() => setShowSplitModal(false)}
//           onSplit={(splits) => {
//             console.log(" SPLIT DONE:", splits);

//             setSplitOrders(splits); // save splits
//             setShowSplitModal(false); // close split modal
//             setShowPaymentModal(true); // open payment modal
//           }}
//         />
//       )}

//       {/* PAYMENT MODAL */}
//       {showPaymentModal && (
//         <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md">
//             <PaymentMethods
//               token={token}
//               user={userState}
//               orderItems={splitOrders.length ? splitOrders : [orderItems]}
//               setOrderItems={setOrderItems}
//               splitOrders={splitOrders}
//               getHeaders={getHeaders}
//               tableId={tableId}
//               grandTotal={grandTotal}
//               onOrderSuccess={resetOrderState}
//               onClose={() => setShowPaymentModal(false)}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect, useMemo } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import SplitOrderModal from "../components/modals/SplitOrderModal";
import { getShiftState } from "../utils/splitLogic/shiftlogic/shiftStatus";

// Components
import CategoriesList from "../components/CategoriesList";
import ItemsList from "../components/ItemsList";
import ModifierModal from "../components/modals/ModifierModal";
import PaymentMethods from "../components/modals/PaymentMethods";
import OrderSummary from "../components/OrderSummary";
import ShiftControls from "../components/ShiftControls";
import FetchTax from "../components/FetchTax";

// Custom Hooks
import { useAuth } from "../hooks/useAuth";
import { useCategories } from "../hooks/useCategories";
import { useItems } from "../hooks/useItems";
import { useModifiers } from "../hooks/useModifiers";
import { useOrder } from "../hooks/useOrder";

// API Base URL
const BASE_URL = "https://tequilapos.net/api";

const Dashboard = () => {
  const { tableId } = useParams();

  const [showAllItems, setShowAllItems] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [splitOrders, setSplitOrders] = useState([]);
  const [showSplitModal, setShowSplitModal] = useState(false);

  const navigate = useNavigate();

  const [taxRate, setTaxRate] = useState(0);

  // --- AUTH ---
  const { token, userState, logout, getHeaders } = useAuth();

  useEffect(() => {
    if (!userState?.shiftStatus) return;

    const state = getShiftState(userState.shiftStatus);

    if (state === "CLOCKED_OUT") {
      navigate("/shiftclock", { replace: true });
    }
  }, [userState?.shiftStatus, navigate]);

  const deriveShiftState = (shiftStatus) => {
    const state = getShiftState(shiftStatus);

    switch (state) {
      case "CLOCKED_IN":
        return "clock_in";
      case "ON_BREAK":
        return "on_break";
      case "ON_MEAL_BREAK":
        return "meal_break";
      default:
        return "clock_out";
    }
  };

  const currentShiftState = useMemo(
    () => deriveShiftState(userState?.shiftStatus),
    [userState?.shiftStatus],
  );

  const resetOrderState = () => {
    setOrderItems([]);
    setShowModal(false);
    setModalItem(null);
    setModalQty(1);
    setModalSelectedMods([]);

    setShowPaymentModal(false);
    navigate("/pos", { replace: true });
  };

  // Logout
  const handleLogout = async () => {
    await logout();          

    toast.success("Logout Successful!", {
      position: "top-center",
    });

    navigate("/", { replace: true });
  };

  // --- CATEGORIES ---
  const {
    categories,
    loadingCategories,
    error: categoriesError,
  } = useCategories(BASE_URL, token);

  // --- ITEMS ---
  const { items, loadingItems, selectedCategory, fetchItems } = useItems(
    BASE_URL,
    token,
  );

  // first category  selected
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      const firstCategoryId = categories[0].id;
      fetchItems(firstCategoryId);
    }
  }, [categories, selectedCategory, fetchItems]);

  // --- MODIFIERS ---
  const { modalModifiers, modalModifiersLoading, fetchModifiers } =
    useModifiers(BASE_URL, token);

  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalSelectedMods, setModalSelectedMods] = useState([]);

  const openAddModal = async (item) => {
    console.log("items", item);
    setModalItem(item);
    setModalQty(1);
    setModalSelectedMods([]);
    setShowModal(true);

    await fetchModifiers(item.id);
  };

  const toggleModalModifier = (id) =>
    setModalSelectedMods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );

  const getModifierById = (id) =>
    modalModifiers.find((m) => String(m.id) === String(id));

  // --- ORDER ---
  const {
    orderItems,
    addToOrderWithModifiers,
    updateOrderQuantity,
    removeOrderItem,
    setOrderItems,
  } = useOrder();

  const { grandTotal } = useMemo(() => {
    const itemsTotal = orderItems.reduce(
      (sum, item) => sum + (item.basePrice || 0) * item.quantity,
      0,
    );

    return {
      grandTotal: +(itemsTotal + itemsTotal * taxRate).toFixed(2),
    };
  }, [orderItems, taxRate]);

  const handleAddToOrder = () => {
    const selectedMods = modalSelectedMods.map(getModifierById).filter(Boolean);
    addToOrderWithModifiers(modalItem, selectedMods, modalQty);
    setShowModal(false);
    setModalItem(null);
  };

  // --- PAYMENT MODAL ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // --- SHIFT CONTROLS MODAL ---
  const [openShiftModal, setOpenShiftModal] = useState(false);

  const shiftLabels = {
    clock_in: "Clocked In",
    clock_out: "Clocked Out",
    on_break: "On Break",
    meal_break: "Meal Break",
    active: "Active",
  };

  const shiftColors = {
    clock_in: "bg-green-100 text-green-700",
    clock_out: "bg-gray-100 text-gray-600",
    on_break: "bg-yellow-100 text-yellow-700",
    meal_break: "bg-orange-100 text-orange-700",
    active: "bg-blue-100 text-blue-700",
  };

  // --- LOADING STATE ---
  if (loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading categories...</p>
      </div>
    );
  }

  const visibleItems = showAllItems ? items : items.slice(0, 8);
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 8);

  // UI
  return (
    <div className="h-screen w-full flex bg-gray-100 overflow-hidden relative">
      {/* TAX  */}
      <FetchTax
        token={token}
        setTaxRate={setTaxRate}
        BASE_URL={BASE_URL}
        getHeaders={getHeaders}
      />

    

      <span
        className={`fixed top-5.5 right-60 px-2 py-1 text-xs rounded border ${shiftColors[currentShiftState]}`}
      >
        {shiftLabels[currentShiftState]}
      </span>

      {/* SHIFT CONTROLS BUTTON */}
      <button
        onClick={() => setOpenShiftModal(true)}
        className="fixed top-4 right-26 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
      >
        Shift Controls
      </button>

      {/* LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
      >
        Logout
      </button>

      {/* ORDER SUMMARY */}
      <OrderSummary
        orderItems={splitOrders.length ? splitOrders[0] : orderItems}
        taxRate={taxRate}
        updateOrderQuantity={updateOrderQuantity}
        removeOrderItem={removeOrderItem}
        onSplitOrder={() => setShowSplitModal(true)}
        onPlaceOrder={() => setShowPaymentModal(true)}
      />
      {tableId && orderItems.length > 0 && (
        <div className="fixed top-5 lg:left-151 left-120 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded shadow z-50">
          Taking Order for Table #{tableId}
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        {categoriesError && (
          <div className="text-red-600 bg-red-50 p-2 rounded mb-4">
            {categoriesError}
          </div>
        )}

        <ItemsList
          loadingItems={loadingItems}
          items={items}
          visibleItems={visibleItems}
          showAllItems={showAllItems}
          setShowAllItems={setShowAllItems}
          openAddModal={openAddModal}
        />

        <CategoriesList
          categories={categories}
          visibleCategories={visibleCategories}
          selectedCategory={selectedCategory}
          fetchItemsByCategory={fetchItems}
          showAllCategories={showAllCategories}
          setShowAllCategories={setShowAllCategories}
        />
      </main>

      {/* MODIFIER MODAL */}
      <ModifierModal
        show={showModal}
        onClose={() => setShowModal(false)}
        item={modalItem}
        qty={modalQty}
        setQty={setModalQty}
        modifiers={modalModifiers}
        loading={modalModifiersLoading}
        selectedMods={modalSelectedMods}
        toggleMod={toggleModalModifier}
        addToOrder={handleAddToOrder}
      />

      {/* SPLIT ORDER MODAL */}
      {showSplitModal && (
        <SplitOrderModal
          orderItems={orderItems}
          onClose={() => setShowSplitModal(false)}
          onSplit={(splits) => {
            console.log(" SPLIT DONE:", splits);

            setSplitOrders(splits); // save splits
            setShowSplitModal(false); // close split modal
            setShowPaymentModal(true); // open payment modal
          }}
        />
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md">
            <PaymentMethods
              token={token}
              user={userState}
              orderItems={splitOrders.length ? splitOrders : [orderItems]}
              setOrderItems={setOrderItems}
              splitOrders={splitOrders}
              getHeaders={getHeaders}
              tableId={tableId}
              grandTotal={grandTotal}
              onOrderSuccess={resetOrderState}
              onClose={() => setShowPaymentModal(false)}
            />
          </div>
        </div>
      )}

      {/* SHIFT CONTROLS MODAL */}
      <ShiftControls
        isOpen={openShiftModal}
        onClose={() => setOpenShiftModal(false)}
      />
    </div>
  );
};

export default Dashboard;
