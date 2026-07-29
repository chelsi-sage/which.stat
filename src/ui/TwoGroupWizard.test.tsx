// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TwoGroupWizard } from './TwoGroupWizard'

// Happy-path UI tests for SPEC-002. Correctness of the recommendation itself is
// covered by SPEC-001's logic tests; here we check the flow wires up right.
describe('TwoGroupWizard (SPEC-002)', () => {
  it('different groups + bell-shaped → recommends the independent-samples t-test', async () => {
    const user = userEvent.setup()
    render(<TwoGroupWizard />)

    await user.click(screen.getByRole('button', { name: /start/i }))
    await user.click(screen.getByLabelText(/^yes/i)) // Q1 outcome continuous
    await user.click(screen.getByLabelText(/different/i)) // Q2 different groups
    await user.click(screen.getByLabelText(/^yes/i)) // Q3 bell-shaped

    expect(
      screen.getByRole('heading', { name: /independent-samples t-test/i }),
    ).toBeInTheDocument()
  })

  it('non-continuous outcome → shows the honest "not covered yet" result', async () => {
    const user = userEvent.setup()
    render(<TwoGroupWizard />)

    await user.click(screen.getByRole('button', { name: /start/i }))
    await user.click(screen.getByLabelText('No', { exact: true })) // Q1: not continuous

    expect(
      screen.getByRole('heading', { name: /not covered yet/i }),
    ).toBeInTheDocument()
  })

  it('the "What does this mean?" explainer reveals its text', async () => {
    const user = userEvent.setup()
    render(<TwoGroupWizard />)

    await user.click(screen.getByRole('button', { name: /start/i }))
    const explainer = screen.getByText(/what does this mean/i)
    await user.click(explainer)

    // Text unique to Q1's explanation paragraph (not the question itself).
    expect(screen.getByText(/in-between values/i)).toBeInTheDocument()
  })

  it('the "Not sure" option is present but disabled on the outcome question', async () => {
    const user = userEvent.setup()
    render(<TwoGroupWizard />)

    await user.click(screen.getByRole('button', { name: /start/i }))
    expect(screen.getByLabelText(/not sure/i)).toBeDisabled()
  })
})
