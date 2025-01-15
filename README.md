# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/519b50e5-6ca3-4c94-9cda-7ad7756c3de2

## Features

### User Profiles
- Create and manage your birdwatching profile
- Import profiles using CSV format
- Download a template CSV file for bulk profile imports
- Supported profile fields:
  - Username
  - Bio
  - Location
  - Experience Level (Beginner/Intermediate/Expert)
  - Preferred Birds
  - Website
  - Social Media Links (Twitter/Instagram)
  - Notification Preferences
  - Privacy Settings

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/519b50e5-6ca3-4c94-9cda-7ad7756c3de2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Authentication & Database)

## Data Import Features

### Profile Import
To import user profiles in bulk:
1. Click the "Download Template" button to get a CSV template
2. Fill in the template with your profile data
3. Use the upload button to import the profiles
4. The template includes example data showing the correct format for all fields

CSV Format:
```csv
username,bio,location,experience_level,preferred_birds,website,social_media.twitter,social_media.instagram,notification_preferences.email,notification_preferences.push,privacy_settings.profile,privacy_settings.observations
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/519b50e5-6ca3-4c94-9cda-7ad7756c3de2) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)