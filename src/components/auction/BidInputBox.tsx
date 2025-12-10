import { useState } from "react";
import { getAuctionSocket } from "@/socket/auctionSocket";
import { useAuctionStore } from "@/stores/auctionStore";
import { useAuthStore } from "@/stores/authStore";

const BidInputBox = () => {
  const auction = useAuctionStore((s) => s.auction);
  const user = useAuthStore((s) => s.user);

  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!auction) return null;

  const currentBid = auction.currentBid ?? auction.current_bid ?? 0;

  const handleBid = () => {
    if (!user) {
      alert("Please login to bid");
      return;
    }

    const bidValue = Number(bidAmount);

    if (!bidValue || isNaN(bidValue)) {
      alert("Enter a valid bid amount");
      return;
    }

    if (bidValue <= currentBid) {
      alert("Your bid must be higher than current bid");
      return;
    }

    const socket = getAuctionSocket();
    if (!socket) {
      alert("Socket not connected");
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
    setTimeout(() => setLoading(false), 500);
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
