
export interface Profile {
  id: string
  username: string
  email?: string
  is_admin: boolean
  location?: string
  experience_level?: string
  logged_on?: string
  logged_on_formatted?: string
  has_pending_support?: boolean
}

export interface EditingState {
  id: string | null
  field: 'username' | 'location' | 'experience_level' | null
  value: string
}

// Add this for GB time format display
export const formatDateTimeGB = (isoString?: string): string => {
  if (!isoString) return 'Never';
  
  // Create a date object from the ISO string
  const date = new Date(isoString);
  
  // Format the date in GB format (day/month/year hour:minute)
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
