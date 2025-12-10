import { create } from "zustand";
import type { Property } from "@/types";
import axios from "@/lib/axios";   // ⭐ FIXED IMPORT

interface PropertyState {
  properties: Property[];
  featuredProperties: Property[];
  currentProperty: Property | null;
  isLoading: boolean;
  error: string | null;

  fetchProperties: () => Promise<void>;
  fetchFeaturedProperties: () => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  featuredProperties: [],
  currentProperty: null,
  isLoading: false,
  error: null,

  // ⭐ Fetch ALL properties
  fetchProperties: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await axios.get("/api/properties/");   // ⭐ FIXED URL

      set({
        properties: res.data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching properties:", error);
      set({ error: "Failed to fetch properties", isLoading: false });
    }
  },

  // ⭐ Fetch featured
  fetchFeaturedProperties: async () => {
    set({ isLoading: true });

    try {
      const res = await axios.get("/api/properties/");   // ⭐ FIXED URL

      set({
        featuredProperties: res.data.slice(0, 4),
        isLoading: false,
      });
    } catch (error) {
      console.error(error);
      set({ error: "Failed to fetch featured properties", isLoading: false });
    }
  },

  // ⭐ Fetch property by ID
  fetchPropertyById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const res = await axios.get(`/api/properties/${id}`);   // ⭐ FIXED URL

      set({
        currentProperty: res.data,
        isLoading: false,
      });
    } catch (error) {
      console.error(error);
      set({
        currentProperty: null,
        isLoading: false,
        error: "Property not found",
      });
    }
  },
}));
