
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
  
  // Each record should have exactly 3 columns: species_name, trend, count
  return records.every(record => record.length === 3)
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
      separator: ',',
      trimLeadingSpace: true,
      trimTrailingSpace: true
    }) as string[][]

    // Validate the CSV structure
    if (!validateCSVStructure(records)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid CSV format', 
          details: 'CSV must have exactly 3 columns: species name, trend, and count' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const birdSpecies = records.map(([species_name, trend, count]) => ({
      species_name: species_name.trim(),
      trend_1970_2014: parseFloat(trend.replace(/[^\d.-]/g, '')) || null,
      observation_count: parseInt(count.replace(/[^\d]/g, '')) || null
    }))

    const { error } = await supabase
      .from('bird_species')
      .insert(birdSpecies)

    if (error) {
      console.error('Error inserting data:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to import bird species', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Bird species imported successfully', 
        count: birdSpecies.length 
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
