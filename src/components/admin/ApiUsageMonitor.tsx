
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ApiUsage = {
  endpoint: string
  tokens_used: number
  cost: number
  created_at: string
}

const ApiUsageMonitor = () => {
  const [timeRange, setTimeRange] = useState<string>("24h")

  const { data: apiUsage, isLoading } = useQuery({
    queryKey: ["api-usage", timeRange],
    queryFn: async () => {
      const timeFilter = timeRange === "24h" 
        ? "created_at > now() - interval '24 hours'"
        : timeRange === "7d"
        ? "created_at > now() - interval '7 days'"
        : "created_at > now() - interval '30 days'"

      const { data, error } = await supabase
        .from("api_usage")
        .select("*")
        .order("created_at", { ascending: false })
        .filter("created_at", "gte", new Date(Date.now() - getTimeInMilliseconds(timeRange)).toISOString())

      if (error) throw error
      return data as ApiUsage[]
    },
  })

  const getTimeInMilliseconds = (range: string) => {
    switch (range) {
      case "24h":
        return 24 * 60 * 60 * 1000
      case "7d":
        return 7 * 24 * 60 * 60 * 1000
      case "30d":
        return 30 * 24 * 60 * 60 * 1000
      default:
        return 24 * 60 * 60 * 1000
    }
  }

  const totalCost = apiUsage?.reduce((sum, usage) => sum + Number(usage.cost), 0) || 0
  const totalTokens = apiUsage?.reduce((sum, usage) => sum + usage.tokens_used, 0) || 0

  const chartData = apiUsage?.reduce((acc: any[], usage) => {
    const existing = acc.find(item => item.endpoint === usage.endpoint)
    if (existing) {
      existing.tokens += usage.tokens_used
      existing.cost += Number(usage.cost)
    } else {
      acc.push({
        endpoint: usage.endpoint,
        tokens: usage.tokens_used,
        cost: Number(usage.cost)
      })
    }
    return acc
  }, [])

  if (isLoading) {
    return <div>Loading API usage data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">OpenAI API Usage</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Cost</CardTitle>
            <CardDescription>For selected time period</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalCost.toFixed(4)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Tokens</CardTitle>
            <CardDescription>For selected time period</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTokens.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage by Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endpoint" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="tokens" fill="#8884d8" name="Tokens" />
                <Bar yAxisId="right" dataKey="cost" fill="#82ca9d" name="Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApiUsageMonitor

