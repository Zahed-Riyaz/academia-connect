import { UserRole } from '../types';

export const ROLE_LABELS: Record<UserRole, string> = {
  professor: 'Professor',
  phd_student: 'PhD Student',
  masters_student: 'Masters Student',
  undergraduate: 'Undergraduate',
  independent_researcher: 'Independent Researcher',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  professor: 'bg-purple-100 text-purple-800',
  phd_student: 'bg-blue-100 text-blue-800',
  masters_student: 'bg-cyan-100 text-cyan-800',
  undergraduate: 'bg-green-100 text-green-800',
  independent_researcher: 'bg-orange-100 text-orange-800',
};

export const OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
  ra_position: 'Research Assistant',
  phd_opening: 'PhD Opening',
  masters_opening: 'Masters Opening',
  postdoc: 'Postdoc',
  collaboration: 'Collaboration',
  project: 'Project',
  internship: 'Internship',
  other: 'Other',
};

export const OPPORTUNITY_TYPE_COLORS: Record<string, string> = {
  ra_position: 'bg-indigo-100 text-indigo-800',
  phd_opening: 'bg-violet-100 text-violet-800',
  masters_opening: 'bg-sky-100 text-sky-800',
  postdoc: 'bg-fuchsia-100 text-fuchsia-800',
  collaboration: 'bg-teal-100 text-teal-800',
  project: 'bg-amber-100 text-amber-800',
  internship: 'bg-lime-100 text-lime-800',
  other: 'bg-gray-100 text-gray-800',
};
