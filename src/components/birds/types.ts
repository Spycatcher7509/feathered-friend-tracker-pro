
export interface BirdMetadata {
  name: string
  scientific_name: string
  description: string
  habitat: string
  size_range: string
  conservation_status: string
  seasonal_patterns: string
}

export interface BirdPrediction {
  label: string
  score: number
}
