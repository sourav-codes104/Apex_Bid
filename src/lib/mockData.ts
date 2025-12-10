import type { Property, Auction, Bid, User } from "@/types";

export const mockUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  isVerified: true,
  walletBalance: 50000,
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
};

export const mockProperties: Property[] = [
  {
    id: "prop-1",
    title: "Luxury 3BHK Apartment in Downtown",
    description: "Stunning modern apartment with panoramic city views. Features include marble flooring, modular kitchen, and premium fixtures throughout.",
    price: 8500000,
    location: "123 Main Street, Downtown",
    city: "Mumbai",
    state: "Maharashtra",
    propertyType: "apartment",
    bhk: 3,
    area: 1850,
    areaUnit: "sqft",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    panoramaUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000",
    amenities: ["Swimming Pool", "Gym", "24/7 Security", "Parking", "Power Backup"],
    ownerName: "Raj Sharma",
    ownerPhone: "+91 98765 43210",
    ownerEmail: "raj.sharma@email.com",
    hasAuction: true,
    auctionId: "auction-1",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "prop-2",
    title: "Spacious 4BHK Villa with Garden",
    description: "Beautiful independent villa with private garden and modern amenities. Perfect for families looking for space and privacy.",
    price: 15000000,
    location: "45 Green Valley Road",
    city: "Bangalore",
    state: "Karnataka",
    propertyType: "villa",
    bhk: 4,
    area: 3200,
    areaUnit: "sqft",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    ],
    panoramaUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=2000",
    amenities: ["Garden", "Terrace", "Modular Kitchen", "Servant Quarter", "Parking"],
    ownerName: "Priya Menon",
    ownerPhone: "+91 87654 32109",
    ownerEmail: "priya.m@email.com",
    hasAuction: false,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "prop-3",
    title: "Modern 2BHK Near Metro Station",
    description: "Conveniently located apartment with excellent connectivity. Ideal for young professionals and small families.",
    price: 4500000,
    location: "78 Metro Plaza",
    city: "Delhi",
    state: "Delhi",
    propertyType: "apartment",
    bhk: 2,
    area: 1100,
    areaUnit: "sqft",
    images: [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800",
    ],
    amenities: ["Gym", "Club House", "Children's Play Area", "Parking"],
    ownerName: "Amit Kumar",
    ownerPhone: "+91 76543 21098",
    ownerEmail: "amit.k@email.com",
    hasAuction: true,
    auctionId: "auction-2",
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-08T10:00:00Z",
  },
  {
    id: "prop-4",
    title: "Premium Commercial Space in Business Hub",
    description: "Prime commercial property in the heart of the business district. Suitable for offices, retail, or showroom.",
    price: 25000000,
    location: "Business Tower, Sector 5",
    city: "Gurugram",
    state: "Haryana",
    propertyType: "commercial",
    bhk: 0,
    area: 5000,
    areaUnit: "sqft",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    ],
    amenities: ["24/7 Access", "Central AC", "High-speed Elevator", "Ample Parking"],
    ownerName: "Commercial Realty Ltd",
    ownerPhone: "+91 65432 10987",
    ownerEmail: "sales@commercialrealty.com",
    hasAuction: false,
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
  },
  {
    id: "prop-5",
    title: "Cozy 1BHK Studio Apartment",
    description: "Perfect starter home or investment property. Fully furnished with modern interiors.",
    price: 2800000,
    location: "12 Sunrise Complex",
    city: "Pune",
    state: "Maharashtra",
    propertyType: "apartment",
    bhk: 1,
    area: 650,
    areaUnit: "sqft",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800",
    ],
    amenities: ["Furnished", "Security", "Power Backup", "Covered Parking"],
    ownerName: "Sneha Patil",
    ownerPhone: "+91 54321 09876",
    ownerEmail: "sneha.p@email.com",
    hasAuction: true,
    auctionId: "auction-3",
    createdAt: "2024-01-03T10:00:00Z",
    updatedAt: "2024-01-03T10:00:00Z",
  },
  {
    id: "prop-6",
    title: "Penthouse with Rooftop Terrace",
    description: "Exclusive penthouse offering unmatched luxury with private rooftop access and stunning views.",
    price: 35000000,
    location: "Skyline Towers, Marine Drive",
    city: "Mumbai",
    state: "Maharashtra",
    propertyType: "apartment",
    bhk: 5,
    area: 4500,
    areaUnit: "sqft",
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800",
    ],
    panoramaUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=2000",
    amenities: ["Private Terrace", "Home Theater", "Wine Cellar", "Private Elevator", "Smart Home"],
    ownerName: "Luxury Estates",
    ownerPhone: "+91 43210 98765",
    ownerEmail: "contact@luxuryestates.com",
    hasAuction: false,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
];

export const mockAuctions: Auction[] = [
  {
    id: "auction-1",
    propertyId: "prop-1",
    property: mockProperties[0],
    startPrice: 7500000,
    currentBid: 8200000,
    highestBidderId: "user-2",
    highestBidderName: "Sarah M.",
    entryFee: 25000,
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 mins ago
    endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // Ends in 90 mins
    status: "live",
    participantsCount: 12,
    minBidIncrement: 50000,
    createdAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "auction-2",
    propertyId: "prop-3",
    property: mockProperties[2],
    startPrice: 4000000,
    currentBid: 4000000,
    entryFee: 15000,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Starts in 2 hours
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: "upcoming",
    participantsCount: 5,
    minBidIncrement: 25000,
    createdAt: "2024-01-14T09:00:00Z",
  },
  {
    id: "auction-3",
    propertyId: "prop-5",
    property: mockProperties[4],
    startPrice: 2500000,
    currentBid: 2500000,
    entryFee: 10000,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Starts tomorrow
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    status: "upcoming",
    participantsCount: 3,
    minBidIncrement: 20000,
    createdAt: "2024-01-13T09:00:00Z",
  },
];

export const mockBids: Bid[] = [
  {
    id: "bid-1",
    auctionId: "auction-1",
    userId: "user-2",
    userName: "Sarah M.",
    amount: 8200000,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "bid-2",
    auctionId: "auction-1",
    userId: "user-3",
    userName: "Mike R.",
    amount: 8100000,
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "bid-3",
    auctionId: "auction-1",
    userId: "user-4",
    userName: "Lisa K.",
    amount: 8000000,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "bid-4",
    auctionId: "auction-1",
    userId: "user-2",
    userName: "Sarah M.",
    amount: 7800000,
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: "bid-5",
    auctionId: "auction-1",
    userId: "user-5",
    userName: "Tom B.",
    amount: 7600000,
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
];

// Format price in Indian currency
export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
};

// Format time remaining
export const formatTimeRemaining = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};
