import { useState } from 'react'
import {
  recommendTwoGroupTest,
  type TwoGroupAnswers,
  type YesNo,
  type Entities,
} from '../domain/recommendTwoGroupTest'
import { testExplanations } from './testExplanations'
import { DataUploadPanel } from './DataUploadPanel'
import { AssumptionCheckScreen } from './AssumptionCheckScreen'
import type { Dataset } from '../engine/dataset'

type Step = 'start' | 'q1' | 'q2' | 'q3' | 'qSmall' | 'checkNormality' | 'result'

// How the "Not sure" option behaves on a question: not shown, greyed-out
// "coming soon", or an active "help me figure it out" that runs a data check.
type NotSureMode = 'hidden' | 'disabled' | 'active'

interface Option {
  label: string
  value: string
}

// A single question screen: legend, radio options, a collapsible explainer,
// an optional "Not sure" (disabled or active), and a Back button.
function QuestionScreen(props: {
  legend: string
  explanation: string
  name: string
  options: Option[]
  currentValue?: string
  notSure: NotSureMode
  onSelect: (value: string) => void
  onNotSure?: () => void
  onBack: () => void
}) {
  return (
    <fieldset className="question">
      <legend>{props.legend}</legend>

      <details className="explainer">
        <summary>What does this mean?</summary>
        <p>{props.explanation}</p>
      </details>

      <div className="options">
        {props.options.map((opt) => (
          <label key={opt.value} className="option">
            <input
              type="radio"
              name={props.name}
              checked={props.currentValue === opt.value}
              onChange={() => props.onSelect(opt.value)}
              onClick={() => props.onSelect(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}

        {props.notSure === 'active' && (
          <label className="option">
            <input
              type="radio"
              name={props.name}
              onChange={() => props.onNotSure?.()}
              onClick={() => props.onNotSure?.()}
            />
            <span>Not sure — help me figure it out</span>
          </label>
        )}

        {props.notSure === 'disabled' && (
          <label className="option option--disabled">
            <input type="radio" name={props.name} disabled />
            <span>
              Not sure <em>(coming soon)</em>
            </span>
          </label>
        )}
      </div>

      <button type="button" className="back" onClick={props.onBack}>
        ← Back
      </button>
    </fieldset>
  )
}

export function TwoGroupWizard() {
  const [step, setStep] = useState<Step>('start')
  const [answers, setAnswers] = useState<Partial<TwoGroupAnswers>>({})
  const [showUpload, setShowUpload] = useState(false)
  // Uploaded data persists across the whole tree — see SPEC-005.
  const [dataset, setDataset] = useState<Dataset | null>(null)

  function reset() {
    setAnswers({})
    setShowUpload(false)
    setDataset(null)
    setStep('start')
  }

  function answerQ1(value: string) {
    const v = value as YesNo
    setAnswers((a) => ({ ...a, outcomeContinuous: v }))
    // Both continuous and categorical branches next ask same/different (Q2).
    setStep('q2')
  }

  function answerQ2(value: string) {
    const v = value as Entities
    setAnswers((a) => ({ ...a, sameEntities: v }))
    if (answers.outcomeContinuous === 'yes') {
      setStep('q3') // continuous branch → distribution question
    } else {
      // categorical branch: different groups → small-sample question;
      // same entities → McNemar (straight to result).
      setStep(v === 'different' ? 'qSmall' : 'result')
    }
  }

  function answerQ3(value: string) {
    setAnswers((a) => ({ ...a, assumptionsMet: value as YesNo }))
    setStep('result')
  }

  function answerQSmall(value: string) {
    setAnswers((a) => ({ ...a, smallSample: value as YesNo }))
    setStep('result')
  }

  if (step === 'start') {
    return (
      <section className="card">
        <h1>which.stat</h1>
        <p className="tagline">
          Answer a few plain-English questions and we'll point you to the right
          statistical test for comparing two groups.
        </p>
        <button type="button" className="primary" onClick={() => setStep('q1')}>
          Start
        </button>
      </section>
    )
  }

  if (step === 'q1') {
    return (
      <section className="card">
        <QuestionScreen
          legend="Is your outcome measured on a continuous scale (like time, a score, or revenue), rather than categories?"
          explanation="A continuous measure can take many in-between values (for example, 4.7 seconds or £312). A category is a label with no in-between, such as “clicked / didn’t click”."
          name="q1"
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          currentValue={answers.outcomeContinuous}
          notSure="disabled"
          onSelect={answerQ1}
          onBack={reset}
        />
      </section>
    )
  }

  if (step === 'q2') {
    return (
      <section className="card">
        <QuestionScreen
          legend="Are the two sets of results from the same people/items measured twice, or from different people/items?"
          explanation="“Same” means you measured one group under two conditions — for example, before and after (this is called paired or repeated). “Different” means two separate groups of people or items."
          name="q2"
          options={[
            { label: 'Different people/items', value: 'different' },
            { label: 'Same people/items, measured twice', value: 'same' },
          ]}
          currentValue={answers.sameEntities}
          notSure="hidden"
          onSelect={answerQ2}
          onBack={() => setStep('q1')}
        />
      </section>
    )
  }

  if (step === 'q3') {
    return (
      <section className="card">
        <QuestionScreen
          legend="Is your data roughly normally distributed (a symmetric, bell-ish shape with no extreme outliers)?"
          explanation="Some tests assume a bell-shaped spread of values. If your data is heavily skewed or has a few extreme values, a different (“non-parametric”) test is safer."
          name="q3"
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          currentValue={answers.assumptionsMet}
          notSure={answers.sameEntities === 'different' ? 'active' : 'disabled'}
          onSelect={answerQ3}
          onNotSure={() => setStep('checkNormality')}
          onBack={() => setStep('q2')}
        />
      </section>
    )
  }

  if (step === 'qSmall') {
    return (
      <section className="card">
        <QuestionScreen
          legend="Is your dataset small — are any of your categories likely to contain only a handful of responses (roughly 5 or fewer)?"
          explanation="The chi-square test needs a reasonable number of responses in each category to be reliable. If some categories are nearly empty, a test built for small samples (Fisher’s exact) is safer."
          name="qSmall"
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          currentValue={answers.smallSample}
          notSure="disabled"
          onSelect={answerQSmall}
          onBack={() => setStep('q2')}
        />
      </section>
    )
  }

  if (step === 'checkNormality') {
    return (
      <section className="card">
        <AssumptionCheckScreen
          dataset={dataset}
          onDataset={setDataset}
          onResolved={(answer) => {
            setAnswers((a) => ({ ...a, assumptionsMet: answer }))
            setStep('result')
          }}
          onBack={() => setStep('q3')}
        />
      </section>
    )
  }

  // step === 'result'
  const rec = recommendTwoGroupTest(answers as TwoGroupAnswers)
  const explanation = testExplanations[rec.testId] ?? ''

  return (
    <section className="card">
      <p className="result-label">
        {rec.covered ? 'Recommended test' : 'Result'}
      </p>
      <h2 className="result-name">{rec.testName}</h2>
      <p className="rationale">{rec.rationale}</p>

      {explanation && (
        <details className="explainer">
          <summary>What this test does &amp; what it means</summary>
          <p>{explanation}</p>
        </details>
      )}

      <p className="citation">Source: {rec.citation}</p>

      <button type="button" className="primary" onClick={reset}>
        Start over
      </button>

      {rec.covered && (
        <button
          type="button"
          className="secondary"
          onClick={() => setShowUpload((s) => !s)}
        >
          {showUpload
            ? 'Hide data upload'
            : dataset
              ? 'Run test on uploaded data'
              : 'Upload data'}
        </button>
      )}

      {rec.covered && showUpload && (
        <DataUploadPanel
          testId={rec.testId}
          dataset={dataset}
          onDataset={setDataset}
        />
      )}
    </section>
  )
}
