export interface User {
  id: number;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface Stats {
  stampCount: number;
  countryCount: number;
}

export interface Stamp {
  id: string;
  placeId: string;
  collectedAt: string;
  distanceM: number | null;
}

export interface Place {
  id: string;
  name: string;
  country: string;
  description: string;
  lat: number;
  lng: number;
  isCurated: boolean;
  isMine: boolean;
  artKey: string | null;
  createdAt: string;
  stamp: Stamp | null;
}
