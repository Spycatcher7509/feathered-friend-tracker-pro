
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function cleanCSVContent(csvContent: string): string {
  // Remove any BOM characters that might be present
  const cleanContent = csvContent.replace(/^\uFEFF/, '')
  
  // Split into lines, remove empty lines, and trim whitespace
  const lines = cleanContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  // Rejoin the lines
  return lines.join('\n')
}

function validateCSVStructure(records: string[][]): boolean {
  // Check if we have any records
  if (records.length === 0) return false
  
  // Each record should have exactly 7 columns for the bird trends data
  return records.every(record => record.length === 7)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { csvContent } = await req.json()

    if (!csvContent) {
      return new Response(
        JSON.stringify({ error: 'No CSV content provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Clean the CSV content
    const cleanedContent = cleanCSVContent(csvContent)
    
    // Parse the cleaned content
    const records = parse(cleanedContent, { 
      skipFirstRow: true,
      separator: '\t', // Using tab as separator since the data is tab-separated
      trimLeadingSpace: true,
      trimTrailingSpace: true
    }) as string[][]

    // Validate the CSV structure
    if (!validateCSVStructure(records)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid CSV format', 
          details: 'CSV must have 7 columns: species name, long-term change, long-term annual change, long-term trend, short-term change, short-term annual change, and short-term trend' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const birdTrends = records.map(([
      species_name,
      long_term_percentage_change,
      long_term_annual_change,
      long_term_trend,
      short_term_percentage_change,
      short_term_annual_change,
      short_term_trend
    ]) => ({
      species_name: species_name.trim(),
      long_term_percentage_change: parseFloat(long_term_percentage_change.replace(/[^\d.-]/g, '')) || null,
      long_term_annual_change: parseFloat(long_term_annual_change.replace(/[^\d.-]/g, '')) || null,
      long_term_trend: long_term_trend.toLowerCase().trim(),
      short_term_percentage_change: parseFloat(short_term_percentage_change.replace(/[^\d.-]/g, '')) || null,
      short_term_annual_change: parseFloat(short_term_annual_change.replace(/[^\d.-]/g, '')) || null,
      short_term_trend: short_term_trend.toLowerCase().trim()
    }))

    const { error } = await supabase
      .from('bird_trends')
      .insert(birdTrends)

    if (error) {
      console.error('Error inserting data:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to import bird trends', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Bird trends imported successfully', 
        count: birdTrends.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error processing CSV:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process CSV file', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
