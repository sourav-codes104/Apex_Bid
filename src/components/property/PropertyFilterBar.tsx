import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePropertyStore } from "@/stores/propertyStore";
import type { PropertyFilters } from "@/types";

const PropertyFilterBar = () => {
  const { filters, setFilters, clearFilters } = usePropertyStore();
  const [location, setLocation] = useState(filters.location || "");

  const handleSearch = () => {
    setFilters({ location });
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters({ [key]: value });
  };

  const FilterContent = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Property Type</label>
        <Select
          value={filters.propertyType || ""}
          onValueChange={(value) =>
            handleFilterChange("propertyType", value || undefined)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="plot">Plot</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">BHK</label>
        <Select
          value={filters.bhk?.toString() || ""}
          onValueChange={(value) =>
            handleFilterChange("bhk", value ? parseInt(value) : undefined)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any BHK" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 BHK</SelectItem>
            <SelectItem value="2">2 BHK</SelectItem>
            <SelectItem value="3">3 BHK</SelectItem>
            <SelectItem value="4">4 BHK</SelectItem>
            <SelectItem value="5">5+ BHK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Price Range</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) =>
              handleFilterChange(
                "minPrice",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              handleFilterChange(
                "maxPrice",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <Select
          value={filters.sortBy || ""}
          onValueChange={(value) =>
            handleFilterChange("sortBy", value || undefined)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="h-4 w-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location, city, or state..."
            className="pl-10"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center gap-3">
          <Select
            value={filters.propertyType || ""}
            onValueChange={(value) =>
              handleFilterChange("propertyType", value || undefined)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.bhk?.toString() || ""}
            onValueChange={(value) =>
              handleFilterChange("bhk", value ? parseInt(value) : undefined)
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="BHK" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 BHK</SelectItem>
              <SelectItem value="2">2 BHK</SelectItem>
              <SelectItem value="3">3 BHK</SelectItem>
              <SelectItem value="4">4+ BHK</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || ""}
            onValueChange={(value) =>
              handleFilterChange("sortBy", value || undefined)
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex lg:hidden gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilterBar;
