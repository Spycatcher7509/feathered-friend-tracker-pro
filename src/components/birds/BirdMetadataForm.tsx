
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BirdMetadata } from "./types"

interface BirdMetadataFormProps {
  metadata: BirdMetadata
  defaultName?: string
  onChange: (field: keyof BirdMetadata, value: string) => void
}

export function BirdMetadataForm({ metadata, defaultName, onChange }: BirdMetadataFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            placeholder={defaultName}
            value={metadata.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Scientific Name</label>
          <Input
            value={metadata.scientific_name}
            onChange={(e) => onChange('scientific_name', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Habitat</label>
          <Input
            value={metadata.habitat}
            onChange={(e) => onChange('habitat', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Size Range</label>
          <Input
            value={metadata.size_range}
            onChange={(e) => onChange('size_range', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Conservation Status</label>
          <Input
            value={metadata.conservation_status}
            onChange={(e) => onChange('conservation_status', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Seasonal Patterns</label>
          <Input
            value={metadata.seasonal_patterns}
            onChange={(e) => onChange('seasonal_patterns', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={metadata.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="h-20"
        />
      </div>
    </div>
  )
}
