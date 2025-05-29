import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the workspace with editor', () => {
    render(<App />)
    // Check for the editor heading
    const heading = screen.getByRole('heading', { name: /Editor/i })
    expect(heading).toBeInTheDocument()

    // Check for the editor description
    const description = screen.getByText(/This is where your blocks will appear/i)
    expect(description).toBeInTheDocument()
  })

  it('renders the sidebar with toggle button', () => {
    render(<App />)
    // Check for the sidebar toggle button
    const toggleButton = screen.getByRole('button', { name: /Collapse sidebar/i })
    expect(toggleButton).toBeInTheDocument()
  })
})
