import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuctionStore } from "@/stores/auctionStore";

// ✅ USE YOUR CONFIGURED AXIOS, NOT RAW AXIOS
import axios from "@/lib/axios";

interface StartAuctionFormProps {
  propertyId: number;
  onClose: () => void;
}

const StartAuctionForm = ({ propertyId, onClose }: StartAuctionFormProps) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);

  const [startingPrice, setStartingPrice] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loading, setLoading] = useState(false);

  const createAuction = async () => {
    if (!startingPrice || !startTime || !endTime) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "/api/auctions/create",
        {
          property_id: propertyId,
          starting_price: Number(startingPrice),
          entry_fee: Number(entryFee) || 0,
          start_time: startTime,
          end_time: endTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Auction created:", res.data);

      await fetchAuctions(); // refresh Zustand store
      navigate("/auctions");
      alert("Auction created successfully!");

      setLoading(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to create auction");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md space-y-3 w-[90%] max-w-md">
      <h2 className="text-xl font-bold mb-2">Start Auction</h2>

      <input
        className="border p-2 rounded w-full"
        type="number"
        placeholder="Starting Price"
        value={startingPrice}
        onChange={(e) => setStartingPrice(e.target.value)}
      />

      <input
        className="border p-2 rounded w-full"
        type="number"
        placeholder="Entry Fee (optional)"
        value={entryFee}
        onChange={(e) => setEntryFee(e.target.value)}
      />

      <label className="text-sm text-gray-600">Start Time</label>
      <input
        className="border p-2 rounded w-full"
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />

      <label className="text-sm text-gray-600">End Time</label>
      <input
        className="border p-2 rounded w-full"
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />

      <button
        onClick={createAuction}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-2"
      >
        {loading ? "Creating..." : "Create Auction"}
      </button>
    </div>
  );
};

export default StartAuctionForm;
