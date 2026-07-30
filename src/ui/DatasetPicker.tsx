import { useState } from 'react'
import { datasetFromFile, type Dataset } from '../engine/dataset'

/**
 * Shared CSV picker + column mapping. When no dataset is loaded it shows a file
 * input; once loaded it shows the file name, the group/outcome dropdowns, and a
 * "use a different file" option. Controlled via `dataset` / `onDataset` so the
 * uploaded data can be held at the wizard level and reused across the tree.
 */
export function DatasetPicker({
  dataset,
  onDataset,
}: {
  dataset: Dataset | null
  onDataset: (d: Dataset | null) => void
}) {
  const [error, setError] = useState('')

  async function onFile(file: File) {
    setError('')
    const result = await datasetFromFile(file)
    if (result.ok) onDataset(result.dataset)
    else setError(result.error)
  }

  if (!dataset) {
    return (
      <div className="dataset-picker">
        <label className="file-field">
          <span>Choose a CSV file</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void onFile(f)
            }}
          />
        </label>
        {error && <p className="engine-error">{error}</p>}
      </div>
    )
  }

  return (
    <div className="dataset-picker">
      <p className="file-name">
        Using your file: <strong>{dataset.name}</strong>{' '}
        <button
          type="button"
          className="link-button"
          onClick={() => onDataset(null)}
        >
          use a different file
        </button>
      </p>
      <div className="mapping">
        <label>
          <span>Which column is the group?</span>
          <select
            value={dataset.groupColumn}
            onChange={(e) =>
              onDataset({ ...dataset, groupColumn: e.target.value })
            }
          >
            {dataset.parsed.headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Which column is the outcome (the numbers)?</span>
          <select
            value={dataset.outcomeColumn}
            onChange={(e) =>
              onDataset({ ...dataset, outcomeColumn: e.target.value })
            }
          >
            {dataset.parsed.headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
