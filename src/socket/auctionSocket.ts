import { io, Socket } from "socket.io-client";
import { useAuctionStore } from "@/stores/auctionStore";
import { toast } from "sonner";   // 🔥 Add toast for real-time alerts

let socket: Socket | null = null;

export const connectAuctionSocket = (token: string) => {
  // Prevent duplicate sockets
  if (socket) return socket;

  socket = io("http://127.0.0.1:5000", {
    transports: ["websocket"],
    auth: { token },
  });

  console.log("🔌 Auction socket connected:", socket.id);

  // ----------------------------------------------------
  // 1️⃣ PARTICIPANT UPDATE
  // ----------------------------------------------------
  socket.on("participant_update", (data) => {
    console.log("👥 participant_update:", data);

    if (typeof data.count === "number") {
      useAuctionStore.getState().updateParticipants(data.count);
    }
  });

  // ----------------------------------------------------
  // 2️⃣ NEW BID UPDATE (LIVE REAL-TIME)
  // ----------------------------------------------------
  socket.on("new_bid", (data) => {
    console.log("💰 new_bid:", data);

    const { amount, bidder_id, bidder_name } = data;

    const store = useAuctionStore.getState();
    const prevAuction = store.auction;

    // Apply store update
    store.applyNewBid(amount, bidder_id, bidder_name);

    // -------------------------
    // 🔥 NOTIFICATIONS (VERY IMPORTANT)
    // -------------------------

    if (!prevAuction) return;

    // The user who placed this bid becomes highest bidder
    if (prevAuction.currentBidderId === bidder_id) {
      toast.success("🎉 You are now the highest bidder!");
    }

    // Another user has outbid YOU
    else if (
      prevAuction.currentBidderId !== null &&
      prevAuction.currentBidderId !== bidder_id
    ) {
      toast.error("⚠️ You have been outbid!");
    }
  });

  // ----------------------------------------------------
  // 3️⃣ TIMER SYNC UPDATE
  // ----------------------------------------------------
  socket.on("timer_update", (data) => {
    console.log("⏳ timer_update:", data);

    if (typeof data.remaining === "number") {
      useAuctionStore.getState().updateTimer(data.remaining);
    }
  });

  // ----------------------------------------------------
  // 4️⃣ AUCTION END UPDATE
  // ----------------------------------------------------
  socket.on("auction_ended", (data) => {
    console.log("🏁 auction_ended:", data);

    useAuctionStore
      .getState()
      .setAuctionEnded(data.final_price, data.winner_id, data.winner_name);

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
    console.log("🟢 Socket Connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket Disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket Connection Error:", err);
    toast.error("Socket connection failed");
  });

  return socket;
};

export const getAuctionSocket = () => socket;
