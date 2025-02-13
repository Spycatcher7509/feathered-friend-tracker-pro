
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download } from "lucide-react"

interface BirdTrendsProps {
  isAdmin?: boolean
}

const BirdTrends = ({ isAdmin = false }: BirdTrendsProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAllData, setShowAllData] = useState(false)

  const { data: birdTrends, isLoading } = useQuery({
    queryKey: ['birdTrends', searchTerm, showAllData],
    queryFn: async () => {
      const query = supabase
        .from('bird_trends')
        .select('*')
        .order('species_name')
      
      if (!isAdmin || !showAllData) {
        if (!searchTerm) return []
        query.ilike('species_name', `%${searchTerm}%`)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })

  const downloadCsv = () => {
    if (!birdTrends?.length) return

    const headers = ['Species Name', 'Long Term Trend', 'Long Term % Change', 'Short Term Trend', 'Short Term % Change']
    const csvContent = [
      headers.join(','),
      ...birdTrends.map(bird => [
        bird.species_name,
        bird.long_term_trend,
        bird.long_term_percentage_change,
        bird.short_term_trend,
        bird.short_term_percentage_change
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bird-trends.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {isAdmin && (
          <Button 
            variant="outline" 
            onClick={() => setShowAllData(!showAllData)}
            className="w-full"
          >
            {showAllData ? "Hide Complete Trend Data" : "Show Complete Trend Data"}
          </Button>
        )}
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search birds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {(birdTrends?.length > 0) && (
            <Button variant="outline" size="sm" onClick={downloadCsv}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Species Name</TableHead>
              <TableHead>Long Term Trend</TableHead>
              <TableHead>Long Term % Change</TableHead>
              <TableHead>Short Term Trend</TableHead>
              <TableHead>Short Term % Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : birdTrends?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {!isAdmin || !showAllData 
                    ? "Enter a bird name to see trend data" 
                    : "No birds found"}
                </TableCell>
              </TableRow>
            ) : (
              birdTrends?.map((bird) => (
                <TableRow key={bird.id}>
                  <TableCell>{bird.species_name}</TableCell>
                  <TableCell>{bird.long_term_trend}</TableCell>
                  <TableCell>{bird.long_term_percentage_change}%</TableCell>
                  <TableCell>{bird.short_term_trend}</TableCell>
                  <TableCell>{bird.short_term_percentage_change}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default BirdTrends
