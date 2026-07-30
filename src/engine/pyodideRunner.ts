import { loadPyodide, version, type PyodideInterface } from 'pyodide'
import type { IndependentTResult } from './verdict'
// The exact Python the user validates with pytest — run unchanged in the browser.
import twoGroupSource from '../../stats_engine/two_group.py?raw'

// Pyodide runtime + scipy load from the official CDN on first use (tens of MB).
// The user's uploaded data never leaves the browser — computation is local.
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`

let pyodidePromise: Promise<PyodideInterface> | null = null

/** Lazily load Pyodide + scipy and register the stats functions. Runs once. */
function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const py = await loadPyodide({ indexURL: INDEX_URL })
      await py.loadPackage('scipy')
      py.runPython(twoGroupSource)
      return py
    })()
  }
  return pyodidePromise
}

/** True once the engine has finished loading at least once. */
export function isEngineLoaded(): boolean {
  return pyodidePromise !== null
}

/** Run the independent-samples t-test on two numeric arrays via the Python engine. */
export async function runIndependentTTest(
  groupA: number[],
  groupB: number[],
): Promise<IndependentTResult> {
  const py = await getPyodide()
  py.globals.set('_a', py.toPy(groupA))
  py.globals.set('_b', py.toPy(groupB))
  const json = py.runPython(
    'import json; json.dumps(independent_t_test(_a, _b))',
  ) as string
  return JSON.parse(json) as IndependentTResult
}
