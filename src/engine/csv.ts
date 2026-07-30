import Papa from 'papaparse'

export interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
}

/**
 * Parse CSV text into headers + row objects. Uses PapaParse so quoted fields,
 * embedded commas, and varied line endings are handled correctly.
 */
export function parseCsv(text: string): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })
  const headers = result.meta.fields?.map((f) => f.trim()) ?? []
  return { headers, rows: result.data }
}

/** Distinct, non-empty values in a column, in first-seen order. */
export function distinctValues(
  rows: Record<string, string>[],
  column: string,
): string[] {
  const seen: string[] = []
  for (const row of rows) {
    const v = (row[column] ?? '').trim()
    if (v !== '' && !seen.includes(v)) seen.push(v)
  }
  return seen
}
