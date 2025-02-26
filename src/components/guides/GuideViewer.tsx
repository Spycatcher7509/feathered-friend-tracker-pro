
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
  const { toast } = useToast()

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const { data, error } = await supabase
          .from("guides")
          .select("title, content")
          .eq("type", type)
          .order("order", { ascending: true })

        if (error) throw error
        setSections(data || [])
      } catch (error) {
        console.error("Error fetching guide:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load the guide content",
        })
      }
    }

    fetchGuide()
  }, [type, toast])

  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Loading guide content...</p>
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
