import { useState } from 'react'
import type { Dataset } from '../engine/dataset'
import { prepareIndependentTTest } from '../engine/prepareIndependentTTest'
import { normalityGuidance, type NormalityGuidance } from '../engine/normality'
import { runNormalityCheck } from '../engine/pyodideRunner'
import { DatasetPicker } from './DatasetPicker'

type Status = 'idle' | 'running' | 'done' | 'error'

/**
 * The "help me figure it out" screen for the distribution (normality) question.
 * The user uploads data (held at the wizard level, so shared across the tree),
 * we run Shapiro-Wilk, show the numbers + a recommendation, and let the user make
 * the final call — their choice is returned via onResolved.
 */
export function AssumptionCheckScreen({
  dataset,
  onDataset,
  onResolved,
  onBack,
}: {
  dataset: Dataset | null
  onDataset: (d: Dataset | null) => void
  onResolved: (answer: 'yes' | 'no') => void
  onBack: () => void
}) {
  const [status, setStatus] = useState<Status>('idle')
  const [guidance, setGuidance] = useState<NormalityGuidance | null>(null)
  const [message, setMessage] = useState('')

  async function onCheck() {
    if (!dataset) return
    const prep = prepareIndependentTTest(
      dataset.parsed.rows,
      dataset.groupColumn,
      dataset.outcomeColumn,
    )
    if (!prep.ok) {
      setStatus('error')
      setMessage(prep.error)
      return
    }
    setStatus('running')
    setMessage('')
    try {
      const res = await runNormalityCheck(prep.data.groupA, prep.data.groupB)
      setGuidance(normalityGuidance(res, prep.data.labelA, prep.data.labelB))
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setMessage(`The engine hit a problem: ${(err as Error).message}`)
    }
  }

  return (
    <div className="check-screen">
      <h2>Let's check: is your data roughly normal?</h2>
      <p>
        Upload your data and we'll run a normality check (Shapiro-Wilk) to help you
        answer. We'll show you the numbers and a recommendation — the final call is
        yours.
      </p>

      <DatasetPicker dataset={dataset} onDataset={onDataset} />

      {dataset && status !== 'done' && (
        <button type="button" className="primary" onClick={() => void onCheck()}>
          Check my data
        </button>
      )}

      {status === 'running' && (
        <p className="engine-loading">
          Checking… the first run downloads the Python engine, which can take a
          moment.
        </p>
      )}

      {status === 'error' && <p className="engine-error">{message}</p>}

      {status === 'done' && guidance && (
        <div className="run-result">
          <p className="verdict">{guidance.text}</p>
          <p>How would you like to answer?</p>
          <div className="decision-buttons">
            <button
              type="button"
              className={guidance.recommended === 'yes' ? 'primary' : 'secondary'}
              onClick={() => onResolved('yes')}
            >
              Yes — roughly normal
              {guidance.recommended === 'yes' ? ' (recommended)' : ''}
            </button>
            <button
              type="button"
              className={guidance.recommended === 'no' ? 'primary' : 'secondary'}
              onClick={() => onResolved('no')}
            >
              No — not normal
              {guidance.recommended === 'no' ? ' (recommended)' : ''}
            </button>
          </div>
        </div>
      )}

      <button type="button" className="back" onClick={onBack}>
        ← Back
      </button>
    </div>
  )
}
