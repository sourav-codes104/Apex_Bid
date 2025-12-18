import { io, Socket } from "socket.io-client";
import { useAuctionStore } from "@/stores/auctionStore";
import { toast } from "sonner";

let socket: Socket | null = null;

export const connectAuctionSocket = (token: string) => {
  // Avoid duplicate socket connections
  if (socket) return socket;

  socket = io("http://127.0.0.1:5000", {
    transports: ["websocket", "polling"],   // IMPORTANT: allow fallback
    extraHeaders: {
      Authorization: `Bearer ${token}`,      // IMPORTANT: backend requires this
    },
  });

  console.log("🔌 Connecting auction socket…");

  // ----------------------------------------------------
  // 1️⃣ PARTICIPANT UPDATE (backend sends: participants)
  // ----------------------------------------------------
  socket.on("participant_update", (data) => {
    console.log("👥 participant_update:", data);

    if (typeof data.participants === "number") {
      useAuctionStore.getState().updateParticipants(data.participants);
    }
  });

  // ----------------------------------------------------
  // 2️⃣ NEW BID UPDATE (backend sends corrected keys)
  // ----------------------------------------------------
  socket.on("new_bid", (data) => {
    console.log("💰 new_bid:", data);

    const {
      current_bid,
      current_bidder_id,
      current_bidder_name,
    } = data;

    const store = useAuctionStore.getState();
    const prev = store.auction;

    store.applyNewBid(
      current_bid,
      current_bidder_id,
      current_bidder_name
    );

    if (!prev) return;

    // 🔔 Feedback to user
    if (current_bidder_id === store.userId) {
      toast.success("🎉 You are now the highest bidder!");
    } else {
      toast.error("⚠️ You have been outbid!");
    }
  });

  // ----------------------------------------------------
  // 3️⃣ TIMER SYNC (backend sends: remaining_seconds)
  // ----------------------------------------------------
  socket.on("timer_update", (data) => {
    console.log("⏳ timer_update:", data);

    if (typeof data.remaining_seconds === "number") {
      useAuctionStore.getState().updateTimer(data.remaining_seconds);
    }
  });

  // ----------------------------------------------------
  // 4️⃣ AUCTION ENDED
  // ----------------------------------------------------
  socket.on("auction_ended", (data) => {
    console.log("🏁 auction_ended:", data);

    useAuctionStore
      .getState()
      .setAuctionEnded(
        data.final_price,
        data.winner_id,
        data.winner_name,
      );

    toast.info(
      `🏁 Auction Ended — Winner: ${
        data.winner_name || "User " + data.winner_id
      }`
    );
  });

  // ----------------------------------------------------
  // CONNECTION LOGGING
  // ----------------------------------------------------
  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
    toast.error("Could not connect to auction server");
  });

  return socket;
};


export const getAuctionSocket = () => socket;
