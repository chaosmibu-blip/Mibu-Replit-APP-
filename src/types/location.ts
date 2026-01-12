/**
 * 地點相關類型
 */

export interface Country {
  id: number;
  code: string;
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameKo: string;
  isActive: boolean;
}

export interface Region {
  id: number;
  countryId: number;
  code: string;
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameKo: string;
  isActive: boolean;
}

export interface CountriesResponse {
  countries: Country[];
}

export interface RegionsResponse {
  regions: Region[];
}
