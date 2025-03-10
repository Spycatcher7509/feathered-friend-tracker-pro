
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

// Improved formatter for GB time format display
export const formatDateTimeGB = (isoString?: string): string => {
  if (!isoString) return 'Never logged in';
  
  try {
    // Create a date object from the ISO string
    const date = new Date(isoString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', isoString);
      return 'Invalid date';
    }
    
    // Format the date in GB format (day/month/year hour:minute)
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};
