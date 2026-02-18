export interface Property {
  id: string;
  title: string;
  address: string;
  area: string;
  rent: number;
  rating: number;
  image: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  features: string[];
  landlordId: string;
  distance: string;
  listed: string;
  fraudScore?: number;
  fraudReason?: string;
}

export interface TenantRequest {
  id: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  propertyId: string;
  propertyTitle: string;
  urgent: boolean;
  status: "pending" | "accepted" | "rejected";
  date: string;
}

export interface TrendingArea {
  area: string;
  count: number;
}

export interface RentAverage {
  area: string;
  avgRent: number;
}

export const properties: Property[] = [
  {
    id: "p1",
    title: "Sunlit Studio in Shibuya",
    address: "2-14-5 Dogenzaka, Shibuya",
    area: "Shibuya",
    rent: 85000,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 450,
    features: ["Balcony", "Pet-friendly", "Near station"],
    landlordId: "l1",
    distance: "3 min walk",
    listed: "2 days ago",
  },
  {
    id: "p2",
    title: "Modern 2LDK in Shinjuku",
    address: "1-8-3 Nishi-Shinjuku",
    area: "Shinjuku",
    rent: 145000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    bedrooms: 2,
    bathrooms: 1,
    sqft: 720,
    features: ["Gym access", "Concierge", "Parking"],
    landlordId: "l1",
    distance: "5 min walk",
    listed: "1 week ago",
  },
  {
    id: "p3",
    title: "Cozy Flat near Ueno Park",
    address: "5-2-1 Ueno, Taito",
    area: "Ueno",
    rent: 72000,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 380,
    features: ["Park view", "Furnished", "Laundry"],
    landlordId: "l2",
    distance: "8 min walk",
    listed: "3 days ago",
  },
  {
    id: "p4",
    title: "Luxury Penthouse in Roppongi",
    address: "6-10-1 Roppongi, Minato",
    area: "Roppongi",
    rent: 320000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    features: ["Rooftop", "Smart home", "City view"],
    landlordId: "l2",
    distance: "2 min walk",
    listed: "5 days ago",
  },
  {
    id: "p5",
    title: "Minimalist 1K in Meguro",
    address: "3-7-2 Kami-Meguro",
    area: "Meguro",
    rent: 95000,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 350,
    features: ["New build", "Floor heating", "Near shops"],
    landlordId: "l1",
    distance: "4 min walk",
    listed: "1 day ago",
  },
  {
    id: "p6",
    title: "Spacious Family Home in Setagaya",
    address: "4-12-8 Setagaya",
    area: "Setagaya",
    rent: 210000,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 980,
    features: ["Garden", "Parking", "Quiet area"],
    landlordId: "l2",
    distance: "10 min walk",
    listed: "4 days ago",
  },
];

export const tenantRequests: TenantRequest[] = [
  {
    id: "r1",
    tenantName: "Yuki Tanaka",
    tenantEmail: "yuki.tanaka@email.com",
    tenantPhone: "+81 90-1234-5678",
    propertyId: "p1",
    propertyTitle: "Sunlit Studio in Shibuya",
    urgent: true,
    status: "pending",
    date: "2026-02-17",
  },
  {
    id: "r2",
    tenantName: "James Park",
    tenantEmail: "james.park@email.com",
    tenantPhone: "+81 80-9876-5432",
    propertyId: "p2",
    propertyTitle: "Modern 2LDK in Shinjuku",
    urgent: false,
    status: "pending",
    date: "2026-02-16",
  },
  {
    id: "r3",
    tenantName: "Mika Suzuki",
    tenantEmail: "mika.s@email.com",
    tenantPhone: "+81 70-5555-1234",
    propertyId: "p4",
    propertyTitle: "Luxury Penthouse in Roppongi",
    urgent: true,
    status: "accepted",
    date: "2026-02-15",
  },
  {
    id: "r4",
    tenantName: "Alex Chen",
    tenantEmail: "alex.chen@email.com",
    tenantPhone: "+81 90-4321-8765",
    propertyId: "p3",
    propertyTitle: "Cozy Flat near Ueno Park",
    urgent: false,
    status: "rejected",
    date: "2026-02-14",
  },
];

export const flaggedListings: (Property & { fraudScore: number; fraudReason: string })[] = [
  {
    ...properties[3],
    fraudScore: 8.2,
    fraudReason: "Unrealistic Rent for Area",
  },
  {
    id: "f1",
    title: "Amazing Deal in Ginza",
    address: "1-1-1 Ginza, Chuo",
    area: "Ginza",
    rent: 25000,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1000,
    features: ["Too good to be true"],
    landlordId: "l3",
    distance: "1 min walk",
    listed: "1 hour ago",
    fraudScore: 9.5,
    fraudReason: "Duplicate Hashing Match",
  },
  {
    id: "f2",
    title: "Budget Room Akihabara",
    address: "3-2-1 Sotokanda",
    area: "Akihabara",
    rent: 15000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
    bedrooms: 2,
    bathrooms: 1,
    sqft: 600,
    features: ["Suspicious listing"],
    landlordId: "l4",
    distance: "2 min walk",
    listed: "3 hours ago",
    fraudScore: 7.1,
    fraudReason: "Multiple Reports Filed",
  },
];

export const trendingAreas: TrendingArea[] = [
  { area: "Shibuya", count: 142 },
  { area: "Shinjuku", count: 128 },
  { area: "Roppongi", count: 95 },
  { area: "Meguro", count: 87 },
  { area: "Setagaya", count: 76 },
  { area: "Ueno", count: 63 },
];

export const rentAverages: RentAverage[] = [
  { area: "Shibuya", avgRent: 120000 },
  { area: "Shinjuku", avgRent: 135000 },
  { area: "Roppongi", avgRent: 180000 },
  { area: "Meguro", avgRent: 100000 },
  { area: "Setagaya", avgRent: 95000 },
  { area: "Ueno", avgRent: 78000 },
];

export const areas = ["All", "Shibuya", "Shinjuku", "Ueno", "Roppongi", "Meguro", "Setagaya"];
export const priceRanges = ["All", "Under ¥80,000", "¥80,000 - ¥150,000", "¥150,000 - ¥250,000", "Over ¥250,000"];
