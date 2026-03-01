import { redirect } from 'next/navigation';

// Redirect /profile/me to /profile/[userId] dynamically on the client
// We use a client-side redirect via the layout's auth context instead
export default function MyProfilePage() {
  // This page exists as a convenience URL; actual redirect handled by a client component
  return null;
}
