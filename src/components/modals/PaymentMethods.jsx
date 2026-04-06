import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SplitOrderModal from "./SplitOrderModal";

export default function PaymentMethods({
  token,
  getHeaders,
  tableId,
  orderItems,
  user,
  onOrderSuccess,
  onClose,
}) {
  const BASE_URL = "https://tequilapos.net/api";

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [loading, setLoading] = useState(false);

  const [showSplitModal, setShowSplitModal] = useState(false);

  const [splitData, setSplitData] = useState(null);

  /* ================= LOAD PAYMENT METHODS ================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${BASE_URL}/payment-methods`, {
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((data) => setPaymentMethods(data.payment_methods || []))
      .catch(() => toast.error("Failed to load payment methods"));
  }, [token]);

  /* ================= CREATE ORDER ================= */
  const createOrder = async () => {
    if (!splitData) {
      throw new Error("Please split the bill first");
    }

    const { mode, splits } = splitData;

    const orderItemsSets = splits.map((split, index) => {
      //  ITEMS / MEMBERS
      if (mode !== "percentage") {
        return {
          split_type: "item_split",
          reference_number: `split_${Date.now()}_${index}`,
          no_of_guest: 1,
          items: split.map((item) => ({
            item_id: Number(item.id),
            quantity: Number(item.quantity),
            is_open_item: false,
            modifier_groups: item.modifier_groups || [], // ⭐ modifiers FIX
            seat_number: item.seat_number || 1,
            chair_id: item.chair_id || null,
            is_split: true,
          })),
        };
      }

      //  PERCENTAGE SPLIT
      return {
        split_type: "percentage_split",
        reference_number: `percent_${Date.now()}_${index}`,
        no_of_guest: 1,
        split_percentage: split.percentage,
        items: split.items.map((item) => ({
          item_id: Number(item.id),
          quantity: Number(item.quantity),
          is_open_item: false,
          modifier_groups: item.modifier_groups || [],
          seat_number: item.seat_number || 1,
          chair_id: item.chair_id || null,
          is_split: true,
        })),
      };
    });

    const payload = {
      table_id: Number(tableId),
      customer_id: user?.id || 125,
      order_type: "1",
      order_items_sets: orderItemsSets,
    };

    console.log(" CREATE ORDER PAYLOAD:", payload);

    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("⬅ CREATE ORDER RESPONSE:", data);

    if (!data.success || !data.data?.sub_orders?.length) {
      throw new Error(data.message || "Order creation failed");
    }

    return data.data.sub_orders;
  };

  /* ================= PAY SUB ORDER ================= */
  const paySubOrder = async (subOrder) => {
    const payload = {
      payments: [
        {
          paymentId: Number(paymentMethodId),
          amount: Number(subOrder.total_amount),
          device_id: "11111111112222222",
        },
      ],
    };

    const res = await fetch(`${BASE_URL}/payments/${subOrder.id}`, {
      method: "POST",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    toast.success("Payment Successfull!");

    if (!data.transaction_ids?.length) {
      throw new Error("Payment failed");
    }

    return data.transaction_ids;
  };

  /* ================= COMPLETE BATCH ================= */
  const completeBatch = async (transactionIds) => {
    const res = await fetch(`${BASE_URL}/tip-batch-complete`, {
      method: "POST",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transaction_ids: transactionIds }),
    });

    const data = await res.json();
    console.log("batch complete", data);
    if (!data.success) {
      throw new Error("Batch completion failed");
    }
  };

  /* ================= MAIN PAYMENT FLOW ================= */
  const handlePayment = async () => {
    try {
      if (!paymentMethodId) {
        toast.error("Select payment method");
        return;
      }

      setLoading(true);

      const subOrders = await createOrder();

      let allTransactionIds = [];

      for (const subOrder of subOrders) {
        if (Number(subOrder.total_amount) <= 0) continue;
        const ids = await paySubOrder(subOrder);
        allTransactionIds.push(...ids);
      }

      await completeBatch(allTransactionIds);

     
      onOrderSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Payment</h2>

      <button
        onClick={() => setShowSplitModal(true)}
        className="w-full mb-3 bg-yellow-500 text-white py-2 rounded"
      >
        Split Bill
      </button>

      {showSplitModal && (
        <SplitOrderModal
          orderItems={orderItems}
          onClose={() => setShowSplitModal(false)}
          onSplit={(data) => {
            console.log(" SPLIT DONE:", data);
            setSplitData(data); //  ONLY THIS
            setShowSplitModal(false);
            toast.success("Bill split successful");
          }}
        />
      )}

      <select
        value={paymentMethodId}
        onChange={(e) => setPaymentMethodId(e.target.value)}
        className="border rounded px-3 py-2 w-full mb-3"
      >
        <option value="">Select Payment Method</option>
        {paymentMethods.map((pm) => (
          <option key={pm.id} value={pm.id}>
            {pm.name}
          </option>
        ))}
      </select>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        {loading ? "Processing..." : "Pay & Complete"}
      </button>

      <button
        onClick={onClose}
        className="w-full bg-gray-200 mt-2 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  );
}
