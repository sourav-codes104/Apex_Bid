import { useState, useEffect } from "react";
import { getAuctionSocket } from "@/socket/auctionSocket";
import { useAuctionStore } from "@/stores/auctionStore";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

const BidInputBox = () => {
  const auction = useAuctionStore((s) => s.auction);
  const user = useAuthStore((s) => s.user);

  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!auction) return null;

  const currentBid = auction.currentBid ?? auction.current_bid ?? 0;

  useEffect(() => {
    const socket = getAuctionSocket();
    if (!socket) return;

    // Listen for bid errors
    const handleError = (err: any) => {
      console.error("❌ Bid error:", err);
      toast.error(err?.error || "Bid placement failed");
      setLoading(false);
    };

    socket.on("error", handleError);

    return () => {
      socket.off("error", handleError);
    };
  }, []);

  const handleBid = () => {
    if (!user) {
      toast.error("Please login to bid");
      return;
    }

    const bidValue = Number(bidAmount);

    if (!bidValue || isNaN(bidValue)) {
      toast.error("Enter a valid bid amount");
      return;
    }

    if (bidValue <= currentBid) {
      toast.error("Your bid must be higher than current bid");
      return;
    }

    const socket = getAuctionSocket();
    if (!socket) {
      toast.error("Socket not connected");
      return;
    }

    setLoading(true);

    socket.emit("place_bid", {
      auction_id: auction.auctionId || auction.id,
      amount: bidValue,
      user_id: user.id,
    });

    console.log("💰 Sent bid:", bidValue);

    setBidAmount("");
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
      <input
        type="number"
        className="flex-1 border p-2 rounded"
        placeholder={`Bid more than ₹${currentBid}`}
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
      />

      <button
        onClick={handleBid}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-green-600"
        }`}
      >
        {loading ? "Sending..." : "Place Bid"}
      </button>
    </div>
  );
};

export default BidInputBox;
