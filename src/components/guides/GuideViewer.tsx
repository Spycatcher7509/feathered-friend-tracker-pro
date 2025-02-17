
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GuideData {
  title: string
  content: string
}

export const GuideViewer = ({ type }: { type: 'user' | 'admin' }) => {
  const [guideData, setGuideData] = useState<GuideData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const { data, error } = await supabase
          .from('guides')
          .select('title, content')
          .eq('type', type)
          .single()

        if (error) throw error
        setGuideData(data)
      } catch (error) {
        console.error('Error fetching guide:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load the guide content",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuide()
  }, [type, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="text-gray-500">Loading guide...</div>
      </div>
    )
  }

  if (!guideData) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="text-gray-500">No guide content available.</div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border p-6 bg-white">
      <div className="prose max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: guideData.content }} />
      </div>
    </ScrollArea>
  )
}
