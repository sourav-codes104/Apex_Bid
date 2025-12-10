import { useAuctionStore } from "@/stores/auctionStore";

const LiveAuctionHeader = () => {
  const auction = useAuctionStore((s) => s.auction);

  if (!auction) return null;

  const statusLabel =
    auction.status === "live"
      ? "LIVE 🔴"
      : auction.status === "upcoming"
      ? "UPCOMING ⏳"
      : auction.status === "ended"
      ? "ENDED ⚫"
      : (auction.status || "").toUpperCase();

  return (
    <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">

      {/* LEFT SIDE - TITLE + STATUS */}
      <div>
        <h1 className="text-2xl font-bold">
          {auction.property_title || "Auction"}
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Auction ID: {auction.id} • {statusLabel}
        </p>

        <p className="text-gray-500 text-sm">
          Starts: {auction.start_time}
        </p>

        <p className="text-gray-500 text-sm">
          Ends: {auction.end_time}
        </p>
      </div>

      {/* RIGHT SIDE - CURRENT BID */}
      <div className="text-right">
        <p className="text-sm text-gray-500">Current Bid</p>

        <p className="text-3xl font-semibold text-blue-600">
          ₹{auction.current_bid ?? auction.starting_price ?? 0}
        </p>

        {auction.current_bidder_id && (
          <p className="text-sm text-green-600 mt-1">
            Leading: User {auction.current_bidder_id}
          </p>
        )}
      </div>

    </div>
  );
};

export default LiveAuctionHeader;
