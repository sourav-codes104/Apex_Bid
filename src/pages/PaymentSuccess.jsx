import { useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { connectAuctionSocket } from "@/socket/auctionSocket";
import { useAuctionStore } from "@/stores/auctionStore";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuctionInfo = useAuctionStore((s) => s.setAuctionInfo);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("order_id");

    if (!orderId) {
      console.error("No order_id found in URL");
      return;
    }

    const verifyPayment = async () => {
      try {
        // -------------------------------
        // 1) VERIFY PAYMENT WITH BACKEND
        // -------------------------------
        const verifyRes = await axios.post(
          "http://127.0.0.1:5000/payments/verify-payment",
          { order_id: orderId }
        );

        const { auction_id, order_status } = verifyRes.data;

        if (order_status !== "PAID") {
          alert("Payment verification failed.");
          return navigate("/auctions");
        }

        // -------------------------------
        // 2) JOIN AUCTION AFTER PAID
        // -------------------------------
        const token = localStorage.getItem("token");

        const joinRes = await axios.post(
          `http://127.0.0.1:5000/api/auctions/${auction_id}/join`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Save auction data to zustand
        setAuctionInfo(joinRes.data);

        // -------------------------------
        // 3) CONNECT SOCKET & JOIN ROOM
        // -------------------------------
        const socket = connectAuctionSocket(token);
        socket.emit("join_auction", { auction_id });

        // -------------------------------
        // 4) REDIRECT TO LIVE AUCTION
        // -------------------------------
        navigate(`/auctions/${auction_id}/live`);

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
