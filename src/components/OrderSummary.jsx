import React, { useMemo } from "react";

const OrderSummary = ({
  orderItems = [],
  taxRate = 0,
  updateOrderQuantity,
  removeOrderItem,
  onPlaceOrder,
}) => {
  console.log("orderItems", orderItems);
  // Totals calculation inside component
  const { subtotal, tax, grandTotal } = useMemo(() => {
    const itemsTotal = orderItems.reduce(
      (sum, it) => sum + (it.basePrice || 0) * it.quantity,
      0
    );

    const modifiersTotal = orderItems.reduce(
      (sum, it) =>
        sum +
        it.quantity *
          (it.modifiers?.reduce((s, m) => s + (m.price || 0), 0) || 0),
      0
    );
    const sub = itemsTotal + modifiersTotal;
    const t = +(sub * taxRate).toFixed(2);
    const g = +(sub + t).toFixed(2);
    return { subtotal: sub, tax: t, grandTotal: g };
  }, [orderItems, taxRate]);

  return (
    <aside className="w-full md:w-1/3 bg-white shadow-md p-6 flex flex-col h-full overflow-hidden">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
        Order Summary
      </h2>

      <div className="flex-1 overflow-y-auto pr-2">
        {orderItems.length === 0 ? (
          <p className="text-gray-500">No items selected.</p>
        ) : (
          <ul className="space-y-3">
            {orderItems.map((it) => (
              <li key={it.compositeId} className="border-b pb-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{it.name}</p>
                    <p className="text-sm text-gray-500">
                      ₹{it.basePrice} × {it.quantity} = ₹
                      {(it.basePrice * it.quantity).toFixed(2)}
                    </p>
                    {it.modifiers?.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        {it.modifiers.map((m) => (
                          <div key={m.id}>
                            ➕ {m.name} (+₹{m.price})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateOrderQuantity(it.compositeId, -1)}
                        className="bg-gray-200 px-2 rounded cursor-pointer"
                      >
                        -
                      </button>
                      <span>{it.quantity}</span>
                      <button
                        onClick={() => updateOrderQuantity(it.compositeId, 1)}
                        className="bg-gray-200 px-2 rounded cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeOrderItem(it.compositeId)}
                      className="text-sm text-red-500 mt-1 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>


      {/* Totals */}
      <div className="mt-4 border-t pt-3 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Items Total:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-2">
          <span>Grand Total:</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={orderItems.length === 0}
          className={`mt-4 w-full py-2 rounded text-white cursor-pointer
          ${
            orderItems.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Place Order
        </button>
      </div>
    </aside>
  );
};

export default OrderSummary;
