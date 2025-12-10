import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePropertyStore } from "@/stores/propertyStore";
import PropertyCard from "@/components/property/PropertyCard";
import { useAuthStore } from "@/stores/authStore";

const Dashboard = () => {
  const { properties, fetchProperties, isLoading } = usePropertyStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProperties();
  }, []);

  // ⭐ Filter user-specific properties
  const myProperties = properties.filter(
    (p) => p.owner_id === user?.id
  );

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Properties</h2>
          <Link to="/add-property">
            <Button>Add New Property</Button>
          </Link>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : myProperties.length === 0 ? (
          <p className="text-muted-foreground">
            You haven't added any properties yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
