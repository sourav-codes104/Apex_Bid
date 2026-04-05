import { useEffect, useState, useRef } from "react";
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
  const setAuctionInfo = useAuctionStore((s) => s.setAuctionInfo);
  const updateParticipants = useAuctionStore((s) => s.updateParticipants);
  const addBidToHistory = useAuctionStore((s) => s.addBidToHistory);
  const auction = useAuctionStore((s) => s.auction);
  const user = useAuthStore((s) => s.user);

  const [hasPaid, setHasPaid] = useState(false);
  const socketRef = useRef<any>(null);

  // ---------------------------------------------------
  // STEP 1 → LOAD AUCTION DETAILS
  // ---------------------------------------------------
  useEffect(() => {
    const loadAuction = async () => {
      try {
        const res = await axios.get(`/api/auctions/${id}`);
        setAuctionInfo(res.data);

        // Check if entry fee is 0 or not required
        if (!res.data.entry_fee_required || res.data.entry_fee === 0) {
          setHasPaid(true);
          await joinAuctionIfNeeded(res.data);
        }
      } catch (err) {
        console.error("Failed to load auction:", err);
      }
    };

    if (id) loadAuction();
  }, [id]);

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
          await joinAuctionIfNeeded(auction);
        }
      } catch (err) {
        console.error("Payment check error:", err);
      }
    };

    checkPayment();
  }, [id, user]);

  // ---------------------------------------------------
  // JOIN LOGIC (Explicit Token Handling)
  // ---------------------------------------------------
  const joinAuctionIfNeeded = async (loadedAuction?: any) => {
    // If already connected, don't re-init
    if (socketRef.current?.connected) return;

    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      console.warn("No token found, skipping join.");
      return;
    }

    try {
      let data = loadedAuction || auction;
      if (!data) {
        const res = await axios.get(`/api/auctions/${id}`);
        data = res.data;
        setAuctionInfo(data);
      }

      if (data.entry_fee_required && !hasPaid) return;

      // 1. CALL JOIN ENDPOINT WITH EXPLICIT AUTH HEADER
      console.log("Attempting to join auction via API...");
      const joinRes = await axios.post(
        `/api/auctions/${id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
      setAuctionInfo(joinRes.data);
      console.log("✅ API Join successful");

      // 2. INITIALIZE SOCKET ONLY AFTER API SUCCESS
      const socket = connectAuctionSocket(currentToken);
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("🟢 Socket connected! Sending join_auction for ID:", id);
        socket.emit("join_auction", { auction_id: Number(id) });
      });

      // --- LISTENERS ---
      socket.on("participant_update", (payload: any) => {
        if (payload && typeof payload.participants !== "undefined") {
          updateParticipants(payload.participants);
        }
      });

      socket.on("new_bid", (payload: any) => {
        if (!payload) return;
        setAuctionInfo({
          ...data,
          current_bid: payload.current_bid,
          current_bidder_id: payload.current_bidder_id,
          current_bidder_name: payload.current_bidder_name,
        });
        addBidToHistory(payload);
      });

      socket.on("timer_update", (payload: any) => {
        setAuctionInfo((prev: any) => ({
          ...prev,
          remaining_seconds: payload.remaining_seconds,
        }));
      });

      socket.on("auction_ended", (payload: any) => {
        setAuctionInfo((prev: any) => ({ ...prev, status: "ended" }));
      });

      socket.on("connect_error", (err: any) => {
        console.error("❌ Socket connect error:", err);
      });
    } catch (err: any) {
      console.error("❌ Join auction flow failed:", err.response?.data || err.message);
    }
  };

  // ---------------------------------------------------
  // PAYMENT HANDLING
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
  // CLEANUP
  // ---------------------------------------------------
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_auction", { auction_id: Number(id) });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [id]);

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
            {!hasPaid && auction.entry_fee > 0 && (
              <div className="p-8 border-2 border-dashed rounded-xl text-center space-y-4">
                <h3 className="text-xl font-semibold">Entry Fee Required</h3>
                <p className="text-muted-foreground">You need to pay the entry fee to participate in this live auction.</p>
                <button
                  onClick={handlePayEntryFee}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Pay Entry Fee (₹{auction?.entry_fee})
                </button>
              </div>
            )}

            {(hasPaid || auction.entry_fee === 0) && (
              <>
                <CountdownTimer />
                <BidInputBox />
              </>
            )}
          </div>

          <div className="md:col-span-1 space-y-6">
            <ParticipantsCounter count={auction?.participants ?? 0} />
            <BidHistorySidebar />
          </div>
        </div>

        <AuctionFinishedModal />
      </div>
    </Layout>
  );
};

export default LiveAuction;