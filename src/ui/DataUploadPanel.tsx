import { useState } from 'react'
import type { Dataset } from '../engine/dataset'
import { prepareIndependentTTest } from '../engine/prepareIndependentTTest'
import { independentTVerdict, type IndependentTResult } from '../engine/verdict'
import { runIndependentTTest } from '../engine/pyodideRunner'
import { DatasetPicker } from './DatasetPicker'

type Status = 'idle' | 'running' | 'done' | 'error'

// Which recommended tests currently have a working engine.
const ENGINE_READY = new Set(['independent_t_test'])

export function DataUploadPanel({
  testId,
  dataset,
  onDataset,
}: {
  testId: string
  dataset: Dataset | null
  onDataset: (d: Dataset | null) => void
}) {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<IndependentTResult | null>(null)
  const [verdict, setVerdict] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  const [message, setMessage] = useState('')

  if (!ENGINE_READY.has(testId)) {
    return (
      <div className="upload-panel">
        <p className="coming-soon">
          Running this test on your own data is coming soon. The independent-samples
          t-test is the first one wired up.
        </p>
      </div>
    )
  }

  async function onRun() {
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
      const res = await runIndependentTTest(prep.data.groupA, prep.data.groupB)
      setResult(res)
      setVerdict(independentTVerdict(res, prep.data.labelA, prep.data.labelB))
      setWarnings(prep.warnings)
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setMessage(`The engine hit a problem: ${(err as Error).message}`)
    }
  }

  return (
    <div className="upload-panel">
      <h3>Run this test on your data</h3>

      <DatasetPicker dataset={dataset} onDataset={onDataset} />

      {dataset && (
        <button type="button" className="primary" onClick={() => void onRun()}>
          Run test
        </button>
      )}

      {status === 'running' && (
        <p className="engine-loading">
          Running… the first run downloads the Python engine, which can take a
          moment.
        </p>
      )}

      {status === 'error' && <p className="engine-error">{message}</p>}

      {status === 'done' && result && (
        <div className="run-result">
          <p className="verdict">{verdict}</p>
          <dl className="numbers">
            <div>
              <dt>t statistic</dt>
              <dd>{result.statistic.toFixed(3)}</dd>
            </div>
            <div>
              <dt>degrees of freedom</dt>
              <dd>{result.df}</dd>
            </div>
            <div>
              <dt>p-value</dt>
              <dd>{result.p_value.toFixed(4)}</dd>
            </div>
            <div>
              <dt>Cohen's d</dt>
              <dd>{result.effect_size_d.toFixed(3)}</dd>
            </div>
          </dl>
          {warnings.length > 0 && (
            <ul className="warnings">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          <p className="engine-note">
            Computed locally by Python (scipy) — your data never left your browser.
          </p>
        </div>
      )}
    </div>
  )
}
