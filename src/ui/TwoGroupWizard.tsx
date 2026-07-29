import { useState } from 'react'
import {
  recommendTwoGroupTest,
  type TwoGroupAnswers,
  type YesNo,
  type Entities,
} from '../domain/recommendTwoGroupTest'
import { testExplanations } from './testExplanations'

type Step = 'start' | 'q1' | 'q2' | 'q3' | 'result'

interface Option {
  label: string
  value: string
}

// A single question screen: legend, radio options, a collapsible explainer,
// an optional disabled "Not sure" (routes to AI later), and a Back button.
function QuestionScreen(props: {
  legend: string
  explanation: string
  name: string
  options: Option[]
  currentValue?: string
  showNotSure: boolean
  onSelect: (value: string) => void
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

        {props.showNotSure && (
          <label className="option option--disabled">
            <input type="radio" name={props.name} disabled />
            <span>
              Not sure <em>(coming soon — AI will help you decide)</em>
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

  function reset() {
    setAnswers({})
    setStep('start')
  }

  function answerQ1(value: string) {
    const v = value as YesNo
    setAnswers((a) => ({ ...a, outcomeContinuous: v }))
    setStep(v === 'no' ? 'result' : 'q2')
  }

  function answerQ2(value: string) {
    setAnswers((a) => ({ ...a, sameEntities: value as Entities }))
    setStep('q3')
  }

  function answerQ3(value: string) {
    setAnswers((a) => ({ ...a, assumptionsMet: value as YesNo }))
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
          showNotSure
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
          showNotSure={false}
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
          showNotSure
          onSelect={answerQ3}
          onBack={() => setStep('q2')}
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
    </section>
  )
}
