import { useEffect } from "react";

const FetchTax = ({ token, setTaxRate, BASE_URL, getHeaders }) => {
  useEffect(() => {
    const fetchTax = async () => {
      try {
        const res = await fetch(`${BASE_URL}/settings`, {
          headers: getHeaders(),
        });

        if (!res.ok) return;

        const data = await res.json();

        const pct =
          parseFloat(
            data?.data?.restaurant_settings?.service_charge
              ?.service_charge_percentage
          ) || 0;

        setTaxRate(pct / 100);
      } catch (err) {
        console.error("Tax fetch error", err);
      }
    };

    if (token) fetchTax();
  }, [token]);

  return null;
};

export default FetchTax;
