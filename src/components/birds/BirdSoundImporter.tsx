import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

const BirdSoundImporter = () => {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv') {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV file",
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/functions/v1/import-bird-sounds', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast({
        title: "Success",
        description: `Imported ${data.count} bird sounds successfully`,
      })

      // Refresh the bird sounds list
      queryClient.invalidateQueries({ queryKey: ['externalBirdSounds'] })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import failed",
        description: error.message,
      })
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        id="csv-upload"
      />
      <label htmlFor="csv-upload">
        <Button
          variant="outline"
          disabled={isUploading}
          className="cursor-pointer"
          asChild
        >
          <span>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </span>
        </Button>
      </label>
    </div>
  )
}

export default BirdSoundImporter