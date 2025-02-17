
export interface Profile {
  id: string
  username: string
  email?: string
  is_admin: boolean
  location?: string
  experience_level?: string
}

export interface EditingState {
  id: string | null
  field: 'username' | 'location' | 'experience_level' | null
  value: string
}
