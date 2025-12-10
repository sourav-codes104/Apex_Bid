import { create } from "zustand";
import axios from "axios";

// --------------------------------------
// TYPES
// --------------------------------------
export interface AuctionState {
  auctionId: number | null;
  status: "upcoming" | "live" | "ended" | null;

  currentBid: number;
  currentBidderId: number | null;
  currentBidderName?: string | null;   // ⭐ ADDED

  remainingSeconds: number;
  participants: number;

  bids: {
    amount: number;
    userId: number;
    userName?: string;
    timestamp?: string;
  }[];

  isRoomJoined: boolean;
}

// --------------------------------------
// STORE INTERFACE
// --------------------------------------
interface AuctionStore {
  auctions: any[];
  liveAuctions: any[];
  upcomingAuctions: any[];

  isLoading: boolean;
  error: string | null;

  auction: AuctionState | null;

  setAuctions: (data: any[]) => void;
  setLiveAuctions: (data: any[]) => void;
  setUpcomingAuctions: (data: any[]) => void;

  setLoading: (value: boolean) => void;
  setError: (msg: string | null) => void;

  fetchAuctions: () => Promise<void>;

  setAuctionInfo: (data: any) => void;
  markRoomJoined: () => void;

  applyNewBid: (amount: number, bidderId: number, bidderName?: string) => void;

  updateTimer: (seconds: number) => void;

  setAuctionEnded: (finalBid: number, winnerId: number, winnerName?: string | null) => void;

  updateParticipants: (count: number) => void;

  resetAuction: () => void;
}

// --------------------------------------
// STORE IMPLEMENTATION
// --------------------------------------
export const useAuctionStore = create<AuctionStore>((set, get) => ({
  auctions: [],
  liveAuctions: [],
  upcomingAuctions: [],

  isLoading: false,
  error: null,

  auction: null,

  setAuctions: (data) => set({ auctions: data }),
  setLiveAuctions: (data) => set({ liveAuctions: data }),
  setUpcomingAuctions: (data) => set({ upcomingAuctions: data }),

  setLoading: (value) => set({ isLoading: value }),
  setError: (msg) => set({ error: msg }),

  // FETCH ALL AUCTIONS
  fetchAuctions: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await axios.get("http://127.0.0.1:5000/api/auctions");
      const data = res.data || [];

      set({
        auctions: data,
        liveAuctions: data.filter((a: any) => a.status === "live"),
        upcomingAuctions: data.filter((a: any) => a.status === "upcoming"),
        isLoading: false,
      });
    } catch (err) {
      set({ error: "Failed to load auctions", isLoading: false });
    }
  },

  // --------------------------------------
  // INITIAL AUCTION DATA FROM JOIN API
  // --------------------------------------
  setAuctionInfo: (data) => {
    set({
      auction: {
        auctionId: data.auction_id,
        status: data.status,

        currentBid: data.current_bid ?? 0,
        currentBidderId: data.current_bidder_id ?? null,
        currentBidderName: data.current_bidder_name ?? null,   // ⭐ ADDED

        remainingSeconds: data.remaining_seconds ?? 0,
        participants: data.participants ?? 1,

        bids: [],
        isRoomJoined: false,
      },
    });
  },

  // --------------------------------------
  // MARK ROOM JOINED
  // --------------------------------------
  markRoomJoined: () => {
    const a = get().auction;
    if (!a) return;

    set({ auction: { ...a, isRoomJoined: true } });
  },

  // --------------------------------------
  // APPLY NEW HIGHEST BID
  // --------------------------------------
  applyNewBid: (amount, bidderId, bidderName) => {
    const a = get().auction;
    if (!a) return;

    set({
      auction: {
        ...a,
        currentBid: amount,
        currentBidderId: bidderId,
        currentBidderName: bidderName || null,   // ⭐ ADDED

        bids: [
          {
            amount,
            userId: bidderId,
            userName: bidderName || null,         // ⭐ ADDED
            timestamp: new Date().toISOString(),
          },
          ...a.bids,
        ],
      },
    });
  },

  // --------------------------------------
  // UPDATE TIMER
  // --------------------------------------
  updateTimer: (seconds) => {
    const a = get().auction;
    if (!a) return;

    set({ auction: { ...a, remainingSeconds: seconds } });
  },

  // --------------------------------------
  // SET AUCTION ENDED
  // --------------------------------------
  setAuctionEnded: (finalBid, winnerId, winnerName = null) => {
    const a = get().auction;
    if (!a) return;

    set({
      auction: {
        ...a,
        status: "ended",
        remainingSeconds: 0,
        currentBid: finalBid,
        currentBidderId: winnerId,
        currentBidderName: winnerName,   // ⭐ ADDED
      },
    });
  },

  // --------------------------------------
  // UPDATE PARTICIPANTS
  // --------------------------------------
  updateParticipants: (count) => {
    const a = get().auction;
    if (!a) return;

    set({ auction: { ...a, participants: count } });
  },

  // --------------------------------------
  // RESET AUCTION ROOM
  // --------------------------------------
  resetAuction: () => {
    set({ auction: null });
  },
}));
