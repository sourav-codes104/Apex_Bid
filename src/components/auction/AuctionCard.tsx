import { Link } from "react-router-dom";

interface AuctionCardProps {
  auction: any;
}

const AuctionCard = ({ auction }: AuctionCardProps) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">

      {/* STATUS BADGE */}
      <div className="mb-2">
        {auction.status === "ended" ? (
          <span className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-semibold">
            ENDED ⚫
          </span>
        ) : auction.status === "live" ? (
          <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
            LIVE 🔴
          </span>
        ) : (
          <span className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold">
            UPCOMING ⏳
          </span>
        )}
      </div>

      {/* TITLE */}
      <h2 className="text-lg font-bold mb-1">
        {auction.property_title || auction.property?.title || "Property"}
      </h2>

      {/* PRICE SECTION */}
      {auction.status === "live" ? (
        <p className="text-gray-700 mb-1">
          Current Bid:{" "}
          <span className="font-semibold text-blue-600">
            ₹{auction.current_bid}
          </span>
        </p>
      ) : auction.status === "upcoming" ? (
        <p className="text-gray-700 mb-1">
          Starting Price:{" "}
          <span className="font-semibold text-blue-600">
            ₹{auction.starting_price}
          </span>
        </p>
      ) : (
        <p className="text-gray-700 mb-1">
          Final Price:{" "}
          <span className="font-semibold text-blue-600">
            ₹{auction.current_bid}
          </span>
        </p>
      )}

      {/* WINNER NAME */}
      {auction.status === "ended" && (
        <p className="text-gray-600 text-sm mb-2">
          Winner:{" "}
          <span className="font-semibold text-green-700">
            {auction.current_bidder_name
              ? auction.current_bidder_name
              : `User ${auction.current_bidder_id}`}
          </span>
        </p>
      )}

      {/* UPCOMING START TIME */}
      {auction.status === "upcoming" && (
        <p className="text-gray-500 text-sm mb-2">
          Starts: {new Date(auction.start_time).toLocaleString()}
        </p>
      )}

      {/* BUTTON AREA */}
      <div className="mt-3">
        {auction.status === "live" ? (
          <Link
            to={`/auction/live/${auction.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded block text-center"
          >
            Join Live Auction
          </Link>
        ) : auction.status === "upcoming" ? (
          <Link
            to={`/auction/upcoming/${auction.id}`}
            className="bg-gray-700 text-white px-4 py-2 rounded block text-center"
          >
            View Details
          </Link>
        ) : (
          <div className="bg-gray-400 text-white px-4 py-2 rounded text-center">
            Auction Ended
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionCard;
