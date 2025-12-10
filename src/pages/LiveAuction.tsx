import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";

import { useAuctionStore } from "@/stores/auctionStore";
import { useAuthStore } from "@/stores/authStore";
import { connectAuctionSocket } from "@/socket/auctionSocket";

import LiveAuctionHeader from "@/components/auction/LiveAuctionHeader";
import CountdownTimer from "@/components/auction/CountdownTimer";
import BidInputBox from "@/components/auction/BidInputBox";
import ParticipantsCounter from "@/components/auction/ParticipantsCounter";
import BidHistorySidebar from "@/components/auction/BidHistorySidebar";
import AuctionFinishedModal from "@/components/auction/AuctionFinishedModal";

import axios from "@/lib/axios";

declare global {
  interface Window {
    Cashfree: any;
  }
}

const LiveAuction = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const setAuctionInfo = useAuctionStore((s) => s.setAuctionInfo);
  const auction = useAuctionStore((s) => s.auction);
  const user = useAuthStore((s) => s.user);

  const [hasPaid, setHasPaid] = useState(false);

  // ---------------------------------------------------
  // STEP 1 → LOAD AUCTION DETAILS FIRST
  // ---------------------------------------------------
  useEffect(() => {
    const loadAuction = async () => {
      try {
        const res = await axios.get(`/api/auctions/${id}`);
        setAuctionInfo(res.data);
      } catch (err) {
        console.error("Failed to load auction:", err);
      }
    };

    if (id) loadAuction();
  }, [id]); // only id

  // ---------------------------------------------------
  // STEP 2 → CHECK PAYMENT STATUS
  // ---------------------------------------------------
  useEffect(() => {
    if (!user || !id) return;

    const checkPayment = async () => {
      try {
        const res = await axios.get(`/payments/check/${id}/${user.id}`);

        if (res.data.paid === true) {
          setHasPaid(true);
          joinAuction();
        }
      } catch (err) {
        console.error("Payment check error:", err);
      }
    };

    checkPayment();
  }, [id, user]);

  // ---------------------------------------------------
  // STEP 3 → JOIN AUCTION
  // ---------------------------------------------------
  const joinAuction = async () => {
    try {
      const res = await axios.post(
        `/api/auctions/${id}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAuctionInfo(res.data);

      const socket = connectAuctionSocket(token);
      socket.emit("join_auction", { auction_id: Number(id) });
    } catch (err) {
      console.error("Join auction failed:", err);
    }
  };

  // ---------------------------------------------------
  // STEP 4 → PAYMENT
  // ---------------------------------------------------
  const handlePayEntryFee = async () => {
    try {
      const res = await axios.post("/payments/create-order", {
        amount: auction?.entry_fee,
        auction_id: Number(id),
        user_id: user?.id,
      });

      const sessionId = res.data.payment_session_id;

      const Cashfree = window.Cashfree;
      if (!Cashfree) {
        alert("Cashfree SDK not loaded");
        return;
      }

      const cf = new Cashfree({ mode: "sandbox" });
      cf.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  // ---------------------------------------------------
  // UI HANDLING
  // ---------------------------------------------------
  if (!auction) {
    return (
      <Layout>
        <div className="p-10 text-center">Loading auction...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 space-y-6">

        <LiveAuctionHeader />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {/* NOT PAID → SHOW ENTRY FEE BUTTON */}
            {!hasPaid && (
              <button
                onClick={handlePayEntryFee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Pay Entry Fee (₹{auction?.entry_fee})
              </button>
            )}

            {/* PAID → SHOW BIDDING UI */}
            {hasPaid && (
              <>
                <CountdownTimer />
                <BidInputBox />
              </>
            )}
          </div>

          {/* FIXED PARTICIPANTS COUNTER */}
          <ParticipantsCounter count={auction?.participants ?? 0} />
        </div>

        <div className="mt-6">
          <BidHistorySidebar />
        </div>

        <AuctionFinishedModal />
      </div>
    </Layout>
  );
};

export default LiveAuction;
