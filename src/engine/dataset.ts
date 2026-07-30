import { parseCsv, type ParsedCsv } from './csv'

/**
 * An uploaded dataset plus the user's column mapping. Held at the wizard level so
 * it stays constant across the whole decision tree — once uploaded, later
 * "help me figure it out" checks reuse it without re-uploading.
 */
export interface Dataset {
  name: string
  parsed: ParsedCsv
  groupColumn: string
  outcomeColumn: string
}

export type DatasetFromFile =
  | { ok: true; dataset: Dataset }
  | { ok: false; error: string }

/** Parse an uploaded CSV file into a Dataset, defaulting the column mapping. */
export async function datasetFromFile(file: File): Promise<DatasetFromFile> {
  const text = await file.text()
  const parsed = parseCsv(text)
  if (parsed.headers.length < 2) {
    return {
      ok: false,
      error: 'That file needs at least two columns (a group and an outcome).',
    }
  }
  return {
    ok: true,
    dataset: {
      name: file.name,
      parsed,
      groupColumn: parsed.headers[0],
      outcomeColumn: parsed.headers[1],
    },
  }
}
