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
  /** The user's own photo of the place — the stamp art. Null until they add one. */
  photoUrl: string | null;
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
