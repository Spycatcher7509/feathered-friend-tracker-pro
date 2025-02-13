
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load the guide content",
        })
      }
    }

    fetchGuide()
  }, [type])

  if (!guideData) return null

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border p-6 bg-white">
      <div className="prose max-w-none">
        <h1 className="text-2xl font-bold mb-4">{guideData.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: guideData.content }} />
      </div>
    </ScrollArea>
  )
}
