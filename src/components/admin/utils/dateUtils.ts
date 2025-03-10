
import { Profile } from "../types"

/**
 * Formats ISO date strings to GB format (day/month/year hour:minute)
 */
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

/**
 * Formats profile timestamps, adding logged_on_formatted property
 */
export const formatProfileTimestamps = (profiles: Profile[] = []): Profile[] => {
  if (!profiles.length) return [];

  // Debug logging for timestamp data
  if (profiles.length > 0) {
    console.log('Sample profile data:', profiles[0]);
    console.log('Sample logged_on value:', profiles[0].logged_on);
  }

  // Format the logged_on timestamps with detailed error checking
  const formattedProfiles = profiles.map(profile => {
    console.log(`Processing profile for ${profile.username || 'unknown'}, logged_on:`, profile.logged_on);
    
    let formattedDate = 'Never logged in';
    if (profile.logged_on) {
      try {
        formattedDate = formatDateTimeGB(profile.logged_on);
        console.log(`Successfully formatted date for ${profile.username}:`, formattedDate);
      } catch (e) {
        console.error(`Error formatting date for ${profile.username}:`, e);
        formattedDate = 'Invalid date';
      }
    } else {
      console.log(`No logged_on value for ${profile.username}`);
    }
    
    return {
      ...profile,
      logged_on_formatted: formattedDate
    };
  });

  console.log('Profiles after formatting:', formattedProfiles);
  return formattedProfiles;
};
