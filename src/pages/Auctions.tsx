import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import AuctionCard from "@/components/auction/AuctionCard";
import { useAuctionStore } from "@/stores/auctionStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import axios from "@/lib/axios";


const Auctions = () => {
  const {
    auctions,
    isLoading,
    error,
    setAuctions,
    setLoading,
    setError
  } = useAuctionStore();

  // Derived auction lists (frontend filtering)
  const liveAuctions = auctions.filter((a) => a.status === "live");
  const upcomingAuctions = auctions.filter((a) => a.status === "upcoming");
  const endedAuctions = auctions.filter((a) => a.status === "ended");

  // ------------------------------
  // FETCH AUCTIONS FROM BACKEND
  // ------------------------------
  useEffect(() => {
    const loadAuctions = async () => {
      try {
        setLoading(true);

        // ⭐ IMPORTANT: Use trailing slash to avoid 308 redirect
        const res = await axios.get("http://127.0.0.1:5000/api/auctions/");

        const data = res.data || [];

        setAuctions(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load auctions");
        setLoading(false);
      }
    };

    loadAuctions();
  }, []);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold mb-2">Property Auctions</h1>
          <p className="text-muted-foreground">Participate in live auctions or check upcoming/ended ones</p>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="live">
              Live ({liveAuctions.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAuctions.length})
            </TabsTrigger>
            <TabsTrigger value="ended">
              Ended ({endedAuctions.length})
            </TabsTrigger>
          </TabsList>

          {/* ---------------- LIVE AUCTIONS ---------------- */}
          <TabsContent value="live" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : liveAuctions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No live auctions right now.</p>
              </div>
            )}
          </TabsContent>

          {/* ---------------- UPCOMING AUCTIONS ---------------- */}
          <TabsContent value="upcoming" className="mt-6">
            {upcomingAuctions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No upcoming auctions.</p>
              </div>
            )}
          </TabsContent>

          {/* ---------------- ENDED AUCTIONS ---------------- */}
          <TabsContent value="ended" className="mt-6">
            {endedAuctions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endedAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No ended auctions.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Auctions;
