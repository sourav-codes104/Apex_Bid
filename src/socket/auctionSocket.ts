import { io, Socket } from "socket.io-client";
import { useAuctionStore } from "@/stores/auctionStore";
import { toast } from "sonner";

let socket: Socket | null = null;

export const getAuctionSocket = () => socket;

export const connectAuctionSocket = (token: string) => {
  // Return existing socket if already connected
  if (socket?.connected) {
    console.log("Reusing existing socket");
    return socket;
  }

  // Clean up old socket
  if (socket) {
    console.log("Cleaning up old socket");
    socket.disconnect();
    socket = null;
  }

  if (!token) {
    console.error("No token provided!");
    toast.error("No authentication token");
    return null;
  }

  console.log("Creating socket with token...", { token: token.substring(0, 20) + "..." });

  // CREATE SOCKET FIRST
  socket = io("http://127.0.0.1:5000", {
    transports: ["websocket", "polling"],  // Allow both transports
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    auth: { token },
    query: { token },
    upgrade: true,
  });

  console.log("Socket object created, attempting connection...");

  // THEN REGISTER LISTENERS
  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  socket.on("connect_error", (err: any) => {
    console.error("🔴 Connect error:", err.message || err);
    console.error("Full error object:", err);
    if (err.data?.content?.message) {
      console.error("Server message:", err.data.content.message);
    }
    // Don't show toast here, might be too spammy during reconnect attempts
    console.error(`Socket connection failed: ${err.message || err}`);
  });

  socket.on("participant_update", (data) => {
    console.log("participant_update:", data);
    if (typeof data.participants === "number") {
      useAuctionStore.getState().updateParticipants(data.participants);
    }
  });

  socket.on("new_bid", (data) => {
    console.log("new_bid:", data);
    const store = useAuctionStore.getState();
    store.applyNewBid(data.current_bid, data.current_bidder_id, data.current_bidder_name);
    
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.id === data.current_bidder_id) {
        toast.success("You are highest bidder");
      } else {
        toast.error("You got outbid");
      }
    }
  });

  socket.on("timer_update", (data) => {
    console.log("timer_update:", data);
    if (typeof data?.remaining_seconds === "number") {
      useAuctionStore.getState().updateTimer(data.remaining_seconds);
    }
  });

  socket.on("auction_ended", (data) => {
    console.log("auction_ended:", data);
    useAuctionStore.getState().setAuctionEnded(
      data?.final_price ?? 0,
      data?.winner_id ?? null,
      data?.winner_name ?? null
    );
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });

  return socket;
};
