// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Dataset } from '../engine/dataset'

// Mock the Pyodide runner so the panel wiring is tested without loading Python.
vi.mock('../engine/pyodideRunner', () => ({
  runIndependentTTest: vi.fn(async () => ({
    statistic: -1.2247,
    df: 4,
    p_value: 0.2879,
    effect_size_d: -1.0,
    mean_a: 4,
    mean_b: 6,
    n_a: 3,
    n_b: 3,
  })),
}))

import { DataUploadPanel } from './DataUploadPanel'

const CSV = 'group,score\ncontrol,2\ncontrol,4\ncontrol,6\nvariant,4\nvariant,6\nvariant,8\n'

// Holds the shared dataset the way the wizard does.
function Harness({ testId }: { testId: string }) {
  const [dataset, setDataset] = useState<Dataset | null>(null)
  return (
    <DataUploadPanel testId={testId} dataset={dataset} onDataset={setDataset} />
  )
}

describe('DataUploadPanel', () => {
  it('shows a coming-soon note for tests without an engine yet', () => {
    render(<Harness testId="mcnemar" />)
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
  })

  it('uploads a CSV, maps columns, runs, and shows the verdict + numbers', async () => {
    const user = userEvent.setup()
    render(<Harness testId="independent_t_test" />)

    const file = new File([CSV], 'data.csv', { type: 'text/csv' })
    await user.upload(screen.getByLabelText(/choose a csv file/i), file)

    await screen.findByText(/which column is the group/i)

    await user.click(screen.getByRole('button', { name: /run test/i }))

    await waitFor(() =>
      expect(
        screen.getByText(/no statistically significant difference/i),
      ).toBeInTheDocument(),
    )
    expect(screen.getByText('-1.225')).toBeInTheDocument()
  })
})
