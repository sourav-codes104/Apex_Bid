import { useEffect, useState } from "react";
import { useAuctionStore } from "@/stores/auctionStore";
import { getAuctionSocket } from "@/socket/auctionSocket";
import { useParams } from "react-router-dom";

const CountdownTimer = () => {
  const auction = useAuctionStore((s) => s.auction);
  const { id } = useParams();

  const [localTime, setLocalTime] = useState(0);

  // ----------------------------------------------
  // SET initial time ONLY when auction loads
  // ----------------------------------------------
  useEffect(() => {
    if (auction?.remainingSeconds != null) {
      setLocalTime(auction.remainingSeconds);
    }
  }, [auction?.id]); 
  // ❗ Trigger ONLY when auction changes (NOT on remainingSeconds)

  // ----------------------------------------------
  // LOCAL countdown
  // ----------------------------------------------
  useEffect(() => {
    if (!auction || auction.status === "ended") return;

    const interval = setInterval(() => {
      setLocalTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [auction?.status]);

  // ----------------------------------------------
  // BACKEND SYNC every 5 sec
  // ----------------------------------------------
  useEffect(() => {
    if (!auction || auction.status === "ended") return;

    const syncInterval = setInterval(() => {
      const socket = getAuctionSocket();
      socket?.emit("sync_timer", { auction_id: Number(id) });
    }, 5000);

    return () => clearInterval(syncInterval);
  }, [auction?.status]);

  // ----------------------------------------------
  // FORMAT
  // ----------------------------------------------
  const format = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (!auction) return null;

  return (
    <div className="bg-black text-white p-4 rounded-lg text-center shadow">
      <p className="text-sm tracking-wide uppercase">Time Remaining</p>
      <p className="text-4xl font-bold mt-2">{format(localTime)}</p>

      {auction.status === "ended" && (
        <p className="text-red-400 font-semibold mt-2">Auction Ended</p>
      )}
    </div>
  );
};

export default CountdownTimer;
