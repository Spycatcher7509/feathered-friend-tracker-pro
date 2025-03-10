
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
