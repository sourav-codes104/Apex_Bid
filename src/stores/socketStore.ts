import { create } from "zustand";
import socketClient from "@/lib/socket";

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Actions
  connect: () => void;
  disconnect: () => void;
  joinAuction: (auctionId: string, userId: string) => void;
  leaveAuction: (auctionId: string, userId: string) => void;
  placeBid: (auctionId: string, userId: string, amount: number) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  isConnecting: false,
  error: null,

  connect: () => {
    set({ isConnecting: true, error: null });
    
    try {
      const socket = socketClient.connect();
      
      socket.on("connect", () => {
        set({ isConnected: true, isConnecting: false });
      });

      socket.on("disconnect", () => {
        set({ isConnected: false });
      });

      socket.on("connect_error", (error) => {
        set({ error: error.message, isConnecting: false, isConnected: false });
      });
    } catch (error) {
      set({ error: "Failed to connect to socket", isConnecting: false });
    }
  },

  disconnect: () => {
    socketClient.disconnect();
    set({ isConnected: false, isConnecting: false });
  },

  joinAuction: (auctionId: string, userId: string) => {
    socketClient.joinAuction(auctionId, userId);
  },

  leaveAuction: (auctionId: string, userId: string) => {
    socketClient.leaveAuction(auctionId, userId);
  },

  placeBid: (auctionId: string, userId: string, amount: number) => {
    socketClient.placeBid(auctionId, userId, amount);
  },
}));
