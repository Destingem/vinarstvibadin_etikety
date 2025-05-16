export interface Winery {
  id: string;
  name: string;
  slug: string;
  email: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wine {
  // Using $id for Appwrite documents
  $id: string;
  name: string;
  vintage?: number;
  batch?: string;
  alcoholContent?: number;
  energyValueKJ?: number;
  energyValueKcal?: number; // Now included in Appwrite schema
  fat?: number;
  saturatedFat?: number;
  carbs?: number;
  sugars?: number;
  protein?: number;
  salt?: number;
  ingredients?: string;
  additionalInfo?: string;
  allergens?: string;
  wineRegion?: string;
  wineSubregion?: string;
  wineVillage?: string;
  wineTract?: string;
  createdAt: string; // Appwrite stores dates as strings
  updatedAt: string; // Appwrite stores dates as strings
  userId: string; // In Appwrite, this is userId not wineryId
  wineryName?: string;
  winerySlug?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface WineFormData {
  name: string;
  vintage?: number;
  batch?: string;
  alcoholContent?: number;
  energyValueKJ?: number;
  energyValueKcal?: number; // Now included in Appwrite schema
  fat?: number;
  saturatedFat?: number;
  carbs?: number;
  sugars?: number;
  protein?: number;
  salt?: number;
  ingredients?: string;
  additionalInfo?: string;
  allergens?: string;
  wineRegion?: string;
  wineSubregion?: string;
  wineVillage?: string;
  wineTract?: string;
}