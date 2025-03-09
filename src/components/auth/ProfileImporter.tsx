
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

const ProfileImporter = () => {
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
      const response = await fetch('/functions/v1/import-profiles', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast({
        title: "Success",
        description: `Imported ${data.count} profiles successfully`,
      })

      // Refresh the profiles list if we have one
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
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

  const handleDownloadTemplate = () => {
    const headers = [
      'username',
      'Date and Time',
      'bio',
      'location',
      'experience_level',
      'preferred_birds',
      'Picture',
      'Bird Song',
      'Comment'
    ].join(',')

    const sampleData = [
      'JohnBirder,,"Passionate bird watcher from Oregon",Portland,Expert,"[\'Eagle\',\'Hawk\',\'Owl\']",,,',
      'AliceWatcher,,"Nature photographer and bird enthusiast",Seattle,Intermediate,"[\'Sparrow\',\'Robin\']",,,',
      'BobNature,,"Beginning bird watcher",Chicago,Beginner,"[\'Cardinal\',\'Blue Jay\']",,,',
    ].join('\n')

    const csvContent = `${headers}\n${sampleData}`
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'profile_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded successfully",
    })
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        id="profile-csv-upload"
      />
      <label htmlFor="profile-csv-upload">
        <Button
          variant="outline"
          disabled={isUploading}
          className="cursor-pointer"
          asChild
        >
          <span>
            <Upload className="h-4 w-4 mr-2" />
            Import Profiles CSV
          </span>
        </Button>
      </label>
      <Button
        variant="outline"
        onClick={handleDownloadTemplate}
        className="cursor-pointer"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Template
      </Button>
    </div>
  )
}

export default ProfileImporter
