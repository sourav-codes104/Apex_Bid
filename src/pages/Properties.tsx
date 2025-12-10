import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import PropertyCard from "@/components/property/PropertyCard";
import { usePropertyStore } from "@/stores/propertyStore";
import { Loader2 } from "lucide-react";

const Properties = () => {
  const { properties, isLoading, fetchProperties } = usePropertyStore();

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold mb-2">Properties</h1>
          <p className="text-muted-foreground">
            Browse our collection of premium properties
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No properties found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Properties;
