import axios from "axios";
import type { Property, Auction, Bid, PropertyFilters } from "@/types";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Property API
export const propertyApi = {
  getAll: async (filters?: PropertyFilters): Promise<Property[]> => {
    const response = await api.get("/properties", { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Property> => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  getFeatured: async (): Promise<Property[]> => {
    const response = await api.get("/properties/featured");
    return response.data;
  },
};

// Auction API
export const auctionApi = {
  getAll: async (): Promise<Auction[]> => {
    const response = await api.get("/auctions");
    return response.data;
  },

  getById: async (id: string): Promise<Auction> => {
    const response = await api.get(`/auctions/${id}`);
    return response.data;
  },

  getLive: async (): Promise<Auction[]> => {
    const response = await api.get("/auctions/live");
    return response.data;
  },

  getUpcoming: async (): Promise<Auction[]> => {
    const response = await api.get("/auctions/upcoming");
    return response.data;
  },

  join: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/auctions/${id}/join`);
    return response.data;
  },

  getBids: async (id: string): Promise<Bid[]> => {
    const response = await api.get(`/auctions/${id}/bids`);
    return response.data;
  },
};

export default api;
