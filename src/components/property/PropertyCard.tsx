import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <Link to={`/properties/${property.id}`}>
      <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-xl font-bold text-white">
              ₹ {property.price.toLocaleString()}
            </p>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {property.location}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;
