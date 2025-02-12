
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
  
  // Split into lines, remove empty lines, headers, and category rows
  const lines = cleanContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      // Skip empty lines, header rows, and category rows
      return line.length > 0 && 
             !line.includes('Long term change') &&
             !line.includes('Short term change') &&
             !line.includes('Specialists') &&
             !line.includes('Generalists') &&
             !line.includes('Seabirds') &&
             !line.includes('water and wetland birds') &&
             !line.startsWith('Species\t')
    })
  
  // Rejoin the lines
  return lines.join('\n')
}

function extractSpeciesName(fullName: string): string {
  // Extract the species name before the parentheses if it exists
  const match = fullName.match(/^([^(]+)/)
  return match ? match[1].trim() : fullName.trim()
}

function parseTrendValue(value: string): number | null {
  // Handle the N/A case
  if (value === 'N/A') return null
  
  // Remove any text in parentheses and other non-numeric characters except - and .
  const cleanValue = value.replace(/\([^)]+\)/g, '').replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleanValue)
  return isNaN(parsed) ? null : parsed
}

function validateCSVStructure(records: string[][]): boolean {
  // Check if we have any records
  if (records.length === 0) return false
  
  // Each record should have exactly 7 columns
  return records.every(record => record.length >= 7)
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
      skipFirstRow: false, // We've already cleaned the headers
      separator: '\t',
      trimLeadingSpace: true,
      trimTrailingSpace: true
    }) as string[][]

    // Validate the CSV structure
    if (!validateCSVStructure(records)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid CSV format', 
          details: 'Each row must have at least 7 columns with the required trend data' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const birdTrends = records
      .filter(record => record[0] && !record[0].includes('term change'))
      .map(([
        species_name,
        long_term_percentage_change,
        long_term_annual_change,
        long_term_trend,
        short_term_percentage_change,
        short_term_annual_change,
        short_term_trend
      ]) => ({
        species_name: extractSpeciesName(species_name),
        long_term_percentage_change: parseTrendValue(long_term_percentage_change),
        long_term_annual_change: parseTrendValue(long_term_annual_change),
        long_term_trend: long_term_trend.toLowerCase().trim(),
        short_term_percentage_change: parseTrendValue(short_term_percentage_change),
        short_term_annual_change: parseTrendValue(short_term_annual_change),
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
