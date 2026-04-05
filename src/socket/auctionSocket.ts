import { io, Socket } from "socket.io-client";
import { useAuctionStore } from "@/stores/auctionStore";
import { toast } from "sonner";

let socket: Socket | null = null;

export const connectAuctionSocket = (token: string) => {

  // Prevent duplicate connections
  if (socket?.connected) return socket;

  socket = io("http://127.0.0.1:5000", {
    transports: ["websocket"],   // websocket only (more stable)
    auth: {
      token: token               // ✅ CORRECT WAY (not extraHeaders)
    }
  });

  console.log("🔌 Connecting auction socket...");

  // ---------------- CONNECT ----------------
  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
    toast.error("Socket connection failed");
  });

  // ---------------- PARTICIPANTS ----------------
  socket.on("participant_update", (data) => {

    console.log("👥 participant_update:", data);

    if (typeof data.participants === "number") {
      useAuctionStore
        .getState()
        .updateParticipants(data.participants);
    }

  });

  // ---------------- NEW BID ----------------
  socket.on("new_bid", (data) => {

    console.log("💰 new_bid:", data);

    const {
      current_bid,
      current_bidder_id,
      current_bidder_name
    } = data;

    const store = useAuctionStore.getState();

    store.applyNewBid(
      current_bid,
      current_bidder_id,
      current_bidder_name
    );

    // feedback
    const user = localStorage.getItem("user");

    if(user){
      const parsed = JSON.parse(user);

      if(parsed.id === current_bidder_id){
        toast.success("You are highest bidder");
      }else{
        toast.error("You got outbid");
      }
    }

  });

  // ---------------- TIMER ----------------
  socket.on("timer_update", (data) => {

    console.log("⏳ timer_update:", data);

    if (typeof data.remaining_seconds === "number") {
      useAuctionStore
        .getState()
        .updateTimer(data.remaining_seconds);
    }

  });

  // ---------------- AUCTION ENDED ----------------
  socket.on("auction_ended", (data) => {

    console.log("🏁 auction_ended:", data);

    useAuctionStore
      .getState()
      .setAuctionEnded(
        data.final_price,
        data.winner_id,
        data.winner_name
      );

    toast.info(
      "Auction ended. Winner: " +
      (data.winner_name || ("User " + data.winner_id))
    );

  });

  return socket;
};

export const getAuctionSocket = () => socket;