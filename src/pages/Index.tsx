import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Building, Gavel, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import PropertyCard from "@/components/property/PropertyCard";
import AuctionCard from "@/components/auction/AuctionCard";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuctionStore } from "@/stores/auctionStore";

const Index = () => {
  const { featuredProperties, fetchFeaturedProperties } = usePropertyStore();

  // ⭐ NEW — Only fetchAuctions() is used in updated store
  const { auctions, fetchAuctions } = useAuctionStore();

  useEffect(() => {
    fetchFeaturedProperties();
    fetchAuctions(); // ⭐ FIXED
  }, []);

  // ⭐ Filter LIVE + UPCOMING
  const liveAuctions = auctions.filter((a) => a.status === "live");
  const upcomingAuctions = auctions.filter((a) => a.status === "upcoming");
  const allAuctions = [...liveAuctions, ...upcomingAuctions];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-auction/5 py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight">
              Find Your Dream <span className="text-primary">Property</span> or
              <span className="text-auction"> Bid Live</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Discover thousands of properties or participate in exclusive live auctions.
              Your next home is just a click away.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mt-8">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Enter location, city, or state..." className="pl-10 h-12" />
              </div>
              <Link to="/properties">
                <Button size="lg" className="w-full sm:w-auto h-12 gap-2">
                  <Search className="h-5 w-5" />
                  Search
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/properties">
                <Button variant="outline" className="gap-2">
                  <Building className="h-4 w-4" />
                  Browse Properties
                </Button>
              </Link>
              <Link to="/auctions">
                <Button variant="outline" className="gap-2 border-auction text-auction hover:bg-auction hover:text-auction-foreground">
                  <Gavel className="h-4 w-4" />
                  View Auctions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Auctions */}
      {allAuctions.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Live & Upcoming Auctions</h2>
                <p className="text-muted-foreground">Don't miss your chance to bid</p>
              </div>
              <Link to="/auctions">
                <Button variant="ghost" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAuctions.slice(0, 3).map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold">Featured Properties</h2>
              <p className="text-muted-foreground">Handpicked properties just for you</p>
            </div>
            <Link to="/properties">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
