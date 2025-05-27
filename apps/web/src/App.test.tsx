// apps/web/src/App.test.tsx
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the heading', () => {
    render(<App />)
    const heading = screen.getByText(/Project Kairos/i)
    expect(heading).toBeInTheDocument()
  })

  it('shows welcome message', () => {
    render(<App />)
    const welcomeText = screen.getByText(/Welcome to your creative writing workspace/i)
    expect(welcomeText).toBeInTheDocument()
  })
})
