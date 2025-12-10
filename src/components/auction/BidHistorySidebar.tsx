import { useAuctionStore } from "@/stores/auctionStore";

const BidHistorySidebar = () => {
  const auction = useAuctionStore((s) => s.auction);

  if (!auction) return null;

  const bids = auction.bids;

  return (
    <div className="bg-white shadow rounded-lg p-4 h-[420px] overflow-y-auto">
      <h3 className="text-xl font-semibold mb-4">Bid History</h3>

      {bids.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          No bids yet — be the first to place one!
        </div>
      ) : (
        <ul className="space-y-3">
          {bids.map((bid, index) => (
            <li
              key={index}
              className="border rounded-lg p-3 bg-gray-50 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-blue-600 text-lg">
                    ₹{bid.amount}
                  </p>
                  <p className="text-sm text-gray-700">
                    by{" "}
                    {bid.userName
                      ? bid.userName
                      : `User ${bid.userId}`}
                  </p>
                </div>

                {bid.timestamp && (
                  <p className="text-xs text-gray-400">
                    {new Date(bid.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BidHistorySidebar;
