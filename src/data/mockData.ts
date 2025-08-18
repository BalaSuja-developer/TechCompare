export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  specs: {
    display: string;
    processor: string;
    ram: string;
    storage: string;
    camera: string;
    battery: string;
    os: string;
  };
  features: string[];
  rating: number;
  reviews: number;
}

// Mock data is now replaced by API calls
// This file is kept for type definitions and fallback data if needed

export const mockProducts: Product[] = [];

// Fallback data for development/testing
export const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    price: 999,
    image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800',
    specs: {
      display: '6.1" Super Retina XDR OLED',
      processor: 'A17 Pro',
      ram: '8GB',
      storage: '128GB',
      camera: '48MP Triple Camera',
      battery: '3274mAh',
      os: 'iOS 17'
    },
    features: ['5G', 'Face ID', 'Wireless Charging', 'Water Resistant'],
    rating: 4.8,
    reviews: 1247
  }
];