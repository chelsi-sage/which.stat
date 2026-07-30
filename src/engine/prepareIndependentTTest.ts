import { distinctValues } from './csv'

export interface TwoGroupData {
  labelA: string
  labelB: string
  groupA: number[]
  groupB: number[]
}

export type PrepareResult =
  | { ok: true; data: TwoGroupData; warnings: string[] }
  | { ok: false; error: string }

/**
 * Turn parsed CSV rows + a column mapping into the two numeric arrays the
 * independent-samples t-test needs, validating along the way with friendly
 * messages (no Python tracebacks reach the user).
 *
 * Rules (SPEC-004):
 * - group column must have exactly two distinct non-empty values
 * - outcome must be numeric; blank/non-numeric cells are excluded with a warning
 * - each group needs at least two usable values
 */
export function prepareIndependentTTest(
  rows: Record<string, string>[],
  groupColumn: string,
  outcomeColumn: string,
): PrepareResult {
  const labels = distinctValues(rows, groupColumn)
  if (labels.length < 2) {
    return {
      ok: false,
      error: `The group column "${groupColumn}" needs two different groups, but found ${labels.length}.`,
    }
  }
  if (labels.length > 2) {
    return {
      ok: false,
      error: `The group column "${groupColumn}" has ${labels.length} groups (${labels.join(
        ', ',
      )}). This test compares exactly two groups.`,
    }
  }

  const [labelA, labelB] = labels
  const groupA: number[] = []
  const groupB: number[] = []
  const warnings: string[] = []

  rows.forEach((row, index) => {
    const group = (row[groupColumn] ?? '').trim()
    const raw = (row[outcomeColumn] ?? '').trim()
    if (group === '') return // row not in either group

    if (raw === '') {
      warnings.push(`Row ${index + 2} has a blank ${outcomeColumn}; excluded.`)
      return
    }
    const value = Number(raw)
    if (!Number.isFinite(value)) {
      warnings.push(
        `Row ${index + 2} has a non-numeric ${outcomeColumn} ("${raw}"); excluded.`,
      )
      return
    }
    if (group === labelA) groupA.push(value)
    else if (group === labelB) groupB.push(value)
  })

  if (groupA.length < 2 || groupB.length < 2) {
    return {
      ok: false,
      error: `Each group needs at least two usable values (found ${groupA.length} for "${labelA}" and ${groupB.length} for "${labelB}").`,
    }
  }

  return { ok: true, data: { labelA, labelB, groupA, groupB }, warnings }
}
