
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

interface BirdDetailsDialogProps {
  name: string
  image: string
  scientificName?: string
  location: string
  date: string
  description?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const BirdDetailsDialog = ({
  name,
  image,
  scientificName,
  location,
  date,
  description,
  isOpen,
  onOpenChange
}: BirdDetailsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-1" /> Details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name} Sighting Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] mt-4">
          <div className="space-y-4">
            <img src={image} alt={name} className="w-full rounded-lg" />
            {scientificName && (
              <div>
                <h4 className="font-semibold">Scientific Name</h4>
                <p className="italic">{scientificName}</p>
              </div>
            )}
            <div>
              <h4 className="font-semibold">Location</h4>
              <p>{location}</p>
            </div>
            <div>
              <h4 className="font-semibold">Date</h4>
              <p>{date}</p>
            </div>
            {description && (
              <div>
                <h4 className="font-semibold">Description</h4>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default BirdDetailsDialog
