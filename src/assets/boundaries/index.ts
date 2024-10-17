import { format_default } from './format';

export type BoundaryId =
  | 'bbmp_wards'
  | 'bbmp_zone'
  | 'bescom_division'
  | 'bescom_subdivision'
  | 'bwssb_division'
  | 'bwssb_service_station'
  | 'police_city'
  | 'police_traffic'
  | 'pincode'
  | 'admin_district'
  | 'admin_taluk'
  | 'election_ac'
  | 'election_pc';

export interface ILayer {
  /** Human-readable name, e.g. "Community District" */
  name: string;

  /** Human-readable name, plural, e.g. "Community Districts" */
  name_long: string;

  /** Succinct definition of what this boundary represents. */
  description: string;

  /** Optional 'learn more' link for the description. */
  description_url?: string;

  /** Icon to display */
  icon: string;

  /** Url to link to for more info */
  formatUrl?: (name: string) => string;

  /** Formatted display name of district, e.g. transforms 101 to Manhattan - 1 */
  formatContent: (name: any) => string;

  /** Parent group for nested hierarchy */
  group?: string;
}

type ILayers = {
  [key in string]: ILayer;
};

export const layers: ILayers = {
  bbmp_wards: {
    name: 'Wards',
    name_long: 'BBMP Wards',
    description: '',
    description_url: '',
    icon: '🏤',
    formatUrl: name => 'https://bbmp.gov.in/',
    formatContent: name => name,
    group: 'BBMP'
  },
  bbmp_zone: {
    name: 'Zones',
    name_long: 'BBMP Zones',
    description: '',
    description_url: '',
    icon: '🏤',
    formatUrl: name => 'https://bbmp.gov.in/',
    formatContent: name => name,
    group: 'BBMP'
  },
  bescom_division: {
    name: 'Divisions',
    name_long: 'BESCOM Divisions',
    description: '',
    description_url: '',
    icon: '💡',
    formatUrl: name => 'https://bescom.co.in/',
    formatContent: name => name,
    group: 'BESCOM'
  },
  bescom_subdivision: {
    name: 'Subdivisions',
    name_long: 'BESCOM Subdivisions',
    description: '',
    description_url: '',
    icon: '💡',
    formatUrl: name => 'https://bescom.co.in/',
    formatContent: name => name,
    group: 'BESCOM'
  },
  bwssb_division: {
    name: 'Divisions',
    name_long: 'BWSSB Divisions',
    description: '',
    description_url: '',
    icon: '💧',
    formatUrl: name => 'https://bwssb.karnataka.gov.in/',
    formatContent: name => name,
    group: 'BWSSB'
  },
  bwssb_service_station: {
    name: 'Service Stations',
    name_long: 'BWSSB Service Stations',
    description: '',
    description_url: '',
    icon: '💧',
    formatUrl: name => 'https://bwssb.karnataka.gov.in/',
    formatContent: name => name,
    group: 'BWSSB'
  },
  police_city: {
    name: 'City Police',
    name_long: 'City Police',
    description: '',
    description_url: '',
    icon: '👮',
    formatUrl: name => 'https://bcp.karnataka.gov.in/',
    formatContent: name => name,
    group: 'Police'
  },
  police_traffic: {
    name: 'Traffic Police',
    name_long: 'Traffic Police',
    description: '',
    description_url: '',
    icon: '🚔',
    formatUrl: name => 'https://btp.gov.in/',
    formatContent: name => name,
    group: 'Police'
  },

  admin_district: {
    name: 'District',
    name_long: 'Districts',
    description: '',
    description_url: '',
    icon: '🏦',
    formatUrl: name => 'https://karnataka.gov.in/',
    formatContent: name => name,
    group: 'Admin'
  },
  admin_taluk: {
    name: 'Taluk',
    name_long: 'Taluks',
    description: '',
    description_url: '',
    icon: '🏦',
    formatUrl: name => 'https://karnataka.gov.in/',
    formatContent: name => name,
    group: 'Admin'
  },
  election_ac: {
    name: 'State Assembly',
    name_long: 'State Assembly',
    description: '',
    description_url: '',
    icon: '🗳',
    formatUrl: name => 'https://kla.kar.nic.in/',
    formatContent: name => name,
    group: 'Election'
  },
  election_pc: {
    name: 'Lok Sabha',
    name_long: 'Lok Sabha',
    description: '',
    description_url: '',
    icon: '🗳',
    formatUrl: name => 'https://sansad.in/ls/',
    formatContent: name => name,
    group: 'Election'
  },
  pincode: {
    name: 'PIN Code',
    name_long: 'Pin Codes',
    description: '',
    description_url: '',
    icon: '📮',
    formatUrl: name =>
      'https://www.indiapost.gov.in/sites/PostalCircles/Karnataka/Pages/cpio.aspx',
    formatContent: name => name
  }
};
