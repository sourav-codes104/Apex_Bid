export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  state: string;
  propertyType: 'apartment' | 'house' | 'villa' | 'plot' | 'commercial';
  bhk: number;
  area: number;
  areaUnit: 'sqft' | 'sqm';
  images: string[];
  panoramaUrl?: string;
  amenities: string[];
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  hasAuction: boolean;
  auctionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Auction {
  id: string;
  propertyId: string;
  property?: Property;
  startPrice: number;
  currentBid: number;
  highestBidderId?: string;
  highestBidderName?: string;
  entryFee: number;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'live' | 'finished' | 'cancelled';
  participantsCount: number;
  minBidIncrement: number;
  createdAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  walletBalance: number;
  avatar?: string;
}

export interface AuctionState {
  auction: Auction | null;
  currentBid: number;
  highestBidderId: string | null;
  highestBidderName: string | null;
  participantsCount: number;
  timeRemaining: number;
  bids: Bid[];
  isFinished: boolean;
  winner?: {
    userId: string;
    userName: string;
    amount: number;
  };
}

export interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  bhk?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
}
