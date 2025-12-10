import { useAuctionStore } from "@/stores/auctionStore";
import { useNavigate } from "react-router-dom";

const AuctionFinishedModal = () => {
  const auction = useAuctionStore((s) => s.auction);
  const navigate = useNavigate();

  if (!auction || auction.status !== "ended") return null;

  // Winner info
  const winnerId = auction.currentBidderId;
  const winnerName = auction.currentBidderName;   // ⭐ new line
  const finalPrice = auction.currentBid;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md text-center animate-fadeIn">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Auction Ended
        </h2>

        <p className="text-lg font-semibold mb-1">
          Winner:{" "}
          <span className="text-blue-600">
            {winnerName ? winnerName : `User ${winnerId}`}
          </span>
        </p>

        <p className="text-lg mb-4">
          Final Price:{" "}
          <span className="font-bold text-green-600">₹{finalPrice}</span>
        </p>

        <button
          onClick={() => navigate("/auctions")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700 transition"
        >
          Back to Auctions
        </button>
      </div>
    </div>
  );
};

export default AuctionFinishedModal;
