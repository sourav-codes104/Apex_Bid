import { useEffect } from "react";
import axios from "@/lib/axios"; // ✅ USE YOUR AXIOS INSTANCE
import { useNavigate, useLocation } from "react-router-dom";
import { useAuctionStore } from "@/stores/auctionStore";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuctionInfo = useAuctionStore((s) => s.setAuctionInfo);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("order_id");

    if (!orderId) {
      console.error("No order_id found");
      return;
    }

    const verifyPayment = async () => {
      try {
        // STEP 1 → Verify payment
        const verifyRes = await axios.post("/payments/verify-payment", {
          order_id: orderId,
        });

        const { auction_id, order_status } = verifyRes.data;

        if (order_status !== "PAID") {
          alert("Payment failed");
          return navigate("/auctions");
        }

        // STEP 2 → Join auction AFTER paid
        const joinRes = await axios.post(`/api/auctions/${auction_id}/join`);

        // Save to Zustand
        setAuctionInfo(joinRes.data);

        // STEP 3 → Redirect to correct Live Auction Route
        navigate(`/auction/live/${auction_id}`);

      } catch (err) {
        console.error("Payment verification error:", err);
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful 🎉</h1>
      <p className="text-gray-500 mt-3">Verifying payment…</p>
    </div>
  );
};

export default PaymentSuccess;
