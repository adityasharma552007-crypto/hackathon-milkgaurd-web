export interface Vendor {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  avgScore: number;
  scanCount: number;
  status: 'safe' | 'warning' | 'danger';
}

export const MOCK_REPORTS = [
  { id: 'v1', name: 'Amul Dairy Booth', area: 'Vaishali Nagar', lat: 26.9124, lng: 75.7873, avgScore: 92, scanCount: 142, status: 'safe' },
  { id: 'v2', name: 'Saras Milk Point', area: 'Mansarovar', lat: 26.8479, lng: 75.7506, avgScore: 88, scanCount: 89, status: 'safe' },
  { id: 'v3', name: 'Jaipur Dairy Co.', area: 'Malviya Nagar', lat: 26.8530, lng: 75.8047, avgScore: 94, scanCount: 210, status: 'safe' },
  { id: 'v4', name: 'Krishna Sweets & Dairy', area: 'C-Scheme', lat: 26.9161, lng: 75.8011, avgScore: 78, scanCount: 65, status: 'warning' },
  { id: 'v5', name: 'Local Supplier - Sanganer', area: 'Sanganer', lat: 26.7899, lng: 75.8105, avgScore: 22, scanCount: 41, status: 'danger' },
  { id: 'v6', name: 'Gopal Dairy', area: 'Bani Park', lat: 26.9272, lng: 75.7903, avgScore: 91, scanCount: 56, status: 'safe' },
  { id: 'v7', name: 'Raj Shudh Milk', area: 'Jhotwara', lat: 26.9416, lng: 75.7338, avgScore: 45, scanCount: 22, status: 'danger' },
  { id: 'v8', name: 'City Dairy Mart', area: 'Adarsh Nagar', lat: 26.8920, lng: 75.8340, avgScore: 86, scanCount: 77, status: 'safe' },
];
