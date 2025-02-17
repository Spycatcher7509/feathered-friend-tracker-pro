
export interface BirdSound {
  id: string
  bird_name: string
  sound_url: string
  source: string
  user_id: string
}

export interface Profile {
  id: string
  username?: string
  bio?: string
  avatar_url?: string
}

export interface BackupData {
  timestamp: string
  profiles: Profile[]
  birdSounds: BirdSound[]
}
