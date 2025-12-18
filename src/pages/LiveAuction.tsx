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
  const token = localStorage.getItem("token");

  const setAuctionInfo = useAuctionStore((s) => s.setAuctionInfo);
  const updateParticipants = useAuctionStore((s) => s.updateParticipants); // implement in store if not present
  const addBidToHistory = useAuctionStore((s) => s.addBidToHistory); // implement if not present
  const auction = useAuctionStore((s) => s.auction);
  const user = useAuthStore((s) => s.user);

  const [hasPaid, setHasPaid] = useState(false);
  const socketRef = useRef<any>(null);

  // ---------------------------------------------------
  // STEP 1 → LOAD AUCTION DETAILS FIRST
  // ---------------------------------------------------
  useEffect(() => {
    const loadAuction = async () => {
      try {
        const res = await axios.get(`/api/auctions/${id}`);
        setAuctionInfo(res.data);

        // If auction doesn't require entry fee, mark as paid locally and join
        if (!res.data.entry_fee_required) {
          setHasPaid(true);
          // joinAuction will run via effect below because hasPaid changes OR call directly:
          await joinAuctionIfNeeded(res.data);
        }
      } catch (err) {
        console.error("Failed to load auction:", err);
      }
    };

    if (id) loadAuction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------------------------------------------------
  // STEP 2 → CHECK PAYMENT STATUS (and join if paid)
  // ---------------------------------------------------
  useEffect(() => {
    if (!user || !id) return;

    const checkPayment = async () => {
      try {
        const res = await axios.get(`/payments/check/${id}/${user.id}`);
        if (res.data.paid === true) {
          setHasPaid(true);
          await joinAuctionIfNeeded(auction); // join with current auction info
        }
      } catch (err) {
        console.error("Payment check error:", err);
      }
    };

    checkPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  // ---------------------------------------------------
  // JOIN LOGIC (single function, idempotent)
  // ---------------------------------------------------
  const joinAuctionIfNeeded = async (loadedAuction?: any) => {
    // If already connected, skip
    if (socketRef.current) return;

    try {
      // If we don't have loadedAuction data, fetch it
      let data = loadedAuction;
      if (!data) {
        const res = await axios.get(`/api/auctions/${id}`);
        data = res.data;
        setAuctionInfo(data);
      }

      // If entry fee required and not paid, do not join
      if (data.entry_fee_required && !hasPaid) {
        return;
      }

      // Call join endpoint (axios instance adds token if present)
      const joinRes = await axios.post(`/api/auctions/${id}/join`);
      setAuctionInfo(joinRes.data);

      // Connect socket once and set listeners
      const socket = connectAuctionSocket(token);
      socketRef.current = socket;

      // Emit join event (server should add socket to room and broadcast participant updates)
      socket.emit("join_auction", { auction_id: Number(id) });

      // --- LISTENERS: update Zustand / UI on events ---
      socket.on("participant_update", (payload: any) => {
        // payload should include participants count or full list
        if (payload && typeof payload.participants !== "undefined") {
          updateParticipants(payload.participants);
          // Also update auction in store (so count shown comes from store)
          setAuctionInfo({ ...joinRes.data, participants: payload.participants });
        }
      });

      socket.on("new_bid", (payload: any) => {
        // payload expected: { current_bid, current_bidder_id, bid, bidder_name, bid_time }
        if (!payload) return;
        // Update auction info
        setAuctionInfo({
          ...joinRes.data,
          current_bid: payload.current_bid,
          current_bidder_id: payload.current_bidder_id,
          current_bidder_name: payload.current_bidder_name,
        });
        // Push to bid history in store
        addBidToHistory(payload);
      });

      socket.on("timer_update", (payload: any) => {
        // payload: { remaining_seconds }
        setAuctionInfo((prev: any) => ({
          ...prev,
          remaining_seconds: payload.remaining_seconds,
        }));
      });

      socket.on("auction_ended", (payload: any) => {
        setAuctionInfo((prev: any) => ({ ...prev, status: "ended" }));
      });

      socket.on("connect_error", (err: any) => {
        console.error("Socket connect error:", err);
      });

    } catch (err) {
      console.error("Join auction failed:", err);
    }
  };

  // ---------------------------------------------------
  // STEP 4 → PAYMENT (unchanged, uses axios instance)
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
  // CLEANUP socket on unmount
  // ---------------------------------------------------
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.emit("leave_auction", { auction_id: Number(id) });
          socketRef.current.disconnect();
        } catch (e) {
          console.warn("Error during socket cleanup", e);
        } finally {
          socketRef.current = null;
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
            {!hasPaid && auction.entry_fee > 0 && (
              <button
                onClick={handlePayEntryFee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Pay Entry Fee (₹{auction?.entry_fee})
              </button>
            )}

            {/* PAID → SHOW BIDDING UI */}
            {(hasPaid || auction.entry_fee === 0) && (
              <>
                <CountdownTimer />
                <BidInputBox />
              </>
            )}
          </div>

          {/* PARTICIPANTS COUNTER */}
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
