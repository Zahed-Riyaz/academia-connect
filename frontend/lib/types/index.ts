export interface ResearchInterest {
  id: number;
  name: string;
  slug: string;
}

export interface UserProfile {
  bio: string;
  profile_picture: string | null;
  institution: string;
  department: string;
  website: string;
  google_scholar_url: string;
  orcid_id: string;
  linkedin_url: string;
  location: string;
  research_interests: ResearchInterest[];
  created_at: string;
  updated_at: string;
}

export type UserRole =
  | 'professor'
  | 'phd_student'
  | 'masters_student'
  | 'undergraduate'
  | 'independent_researcher';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  profile: UserProfile;
  publications?: Publication[];
  date_joined: string;
}

export interface Publication {
  id: number;
  title: string;
  authors: string;
  publication_type: string;
  venue: string;
  year: number;
  doi: string;
  url: string;
  abstract: string;
  created_at: string;
}

export type OpportunityType =
  | 'ra_position'
  | 'phd_opening'
  | 'masters_opening'
  | 'postdoc'
  | 'collaboration'
  | 'project'
  | 'internship'
  | 'other';

export interface Opportunity {
  id: number;
  author: User;
  opportunity_type: OpportunityType;
  title: string;
  description: string;
  institution: string;
  location: string;
  is_remote: boolean;
  required_role: string;
  research_areas: ResearchInterest[];
  funding_available: boolean;
  stipend_details: string;
  deadline: string | null;
  contact_email: string;
  external_url: string;
  is_active: boolean;
  is_bookmarked: boolean;
  created_at: string;
  updated_at: string;
}

export type ConnectionStatus =
  | 'none'
  | 'pending_sent'
  | 'pending_received'
  | 'connected'
  | 'following'
  | 'followed_by'
  | 'mutual_follow';

export interface Connection {
  id: number;
  sender: User;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  sender: User;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  participants: User[];
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count?: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CursorPaginatedResponse<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}
