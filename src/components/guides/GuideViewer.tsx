
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface GuideSection {
  title: string
  content: string
}

export const GuideViewer = ({ type }: { type: "user" | "admin" }) => {
  const [sections, setSections] = useState<GuideSection[]>([])
  const [activeTab, setActiveTab] = useState("0")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("Fetching guide content for type:", type)
        
        const { data, error } = await supabase
          .from("guides")
          .select("title, content, sort_order")
          .eq("type", type)
          .order("sort_order", { ascending: true })

        if (error) {
          console.error("Error fetching guide:", error)
          throw error
        }

        if (!data || data.length === 0) {
          console.log("No guide content found")
          setError("No guide content available.")
          return
        }

        console.log("Retrieved guide sections:", data.length)
        setSections(data)
      } catch (error) {
        console.error("Error fetching guide:", error)
        setError("Could not load the guide content. Please try again later.")
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
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Loading guide content...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No guide content available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-nature-200 shadow-lg animate-fadeIn">
      <CardHeader className="bg-gradient-to-r from-nature-50 to-nature-100 border-b border-nature-200">
        <CardTitle className="text-2xl font-playfair text-nature-800">
          {type === "user" ? "User Guide" : "Administrator Guide"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex-wrap justify-start bg-nature-50 p-1">
            {sections.map((section, index) => (
              <TabsTrigger
                key={index}
                value={index.toString()}
                className="data-[state=active]:bg-white data-[state=active]:text-nature-800"
              >
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-6">
            {sections.map((section, index) => (
              <TabsContent
                key={index}
                value={index.toString()}
                className="bg-white rounded-lg border border-nature-100 p-6"
              >
                <ScrollArea className="h-[500px] pr-4">
                  <div
                    className="prose prose-nature max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </ScrollArea>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
