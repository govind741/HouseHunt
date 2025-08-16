export interface CityType {
  id: number;
  name: string;
}

export interface AreaType {
  id: number;
  name: string;
  city_id: number;
}

export interface LocalityType {
  area_id: number;
  city_id: number;
  id: number;
  name: string;
  ranking: number;
}

export interface locationType {
  area_id: number | null;
  city_id: number | null;
  id: number | null;
  name: string;
  ranking: number | null;
  city_name: string;
  area_name: string;
  locality_name: string;
}

export interface workLocationType {
  location_id: number;
  area_id: number | null;
  city_id: number | null;
}

export interface globalLocationSearch {
  city_name: string;
  area_name: string;
  locality_name: string;
  id: number;
}

export interface AgentUserType {
  agency_name: string;
  agent_id: number;
  email: string;
  experience_years: string;
  image_urls: string[];
  languages_spoken: string[];
  min_ranking: number;
  name: string;
  office_address: string | null;
  phone: string;
  rating: string;
  sponsorship_status: number;
  status: number;
  whatsapp_number: number;
  role: string;
  id: number;
  images: string[];
  image_url: string;
  description: string;
}

export interface UserType {
  id: number;
  name: string;
  dob: string;
  phone: string;
  email: string;
  profile: string;
  role: string;
  status: number;
  location: {address: string; latitude: number; longitude: number};
}
