// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Dataset } from '../engine/dataset'

// Mock the Pyodide runner: return a non-normal result so the recommendation is "no".
vi.mock('../engine/pyodideRunner', () => ({
  runNormalityCheck: vi.fn(async () => ({
    group_a: { w: 0.97, p: 0.4, n: 3 },
    group_b: { w: 0.6, p: 0.0001, n: 3 },
    normal: false,
  })),
}))

import { AssumptionCheckScreen } from './AssumptionCheckScreen'

const CSV = 'group,score\ncontrol,2\ncontrol,4\ncontrol,6\nvariant,4\nvariant,6\nvariant,8\n'

function Harness({ onResolved }: { onResolved: (a: 'yes' | 'no') => void }) {
  const [dataset, setDataset] = useState<Dataset | null>(null)
  return (
    <AssumptionCheckScreen
      dataset={dataset}
      onDataset={setDataset}
      onResolved={onResolved}
      onBack={() => {}}
    />
  )
}

describe('AssumptionCheckScreen', () => {
  it('uploads data, runs the check, shows guidance, and returns the user choice', async () => {
    const user = userEvent.setup()
    const onResolved = vi.fn()
    render(<Harness onResolved={onResolved} />)

    const file = new File([CSV], 'data.csv', { type: 'text/csv' })
    await user.upload(screen.getByLabelText(/choose a csv file/i), file)

    await user.click(screen.getByRole('button', { name: /check my data/i }))

    // Guidance appears and recommends "no" (skewed group).
    await waitFor(() =>
      expect(screen.getByText(/non-normal/i)).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('button', { name: /no — not normal \(recommended\)/i }),
    ).toBeInTheDocument()

    // The user makes the final call.
    await user.click(screen.getByRole('button', { name: /yes — roughly normal/i }))
    expect(onResolved).toHaveBeenCalledWith('yes')
  })
})
