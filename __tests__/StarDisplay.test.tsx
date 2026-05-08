/**
 * __tests__/StarDisplay.test.tsx
 *
 * Unit tests for the StarDisplay component.
 * Run: npm test -- --testPathPattern=StarDisplay
 */

import { render, screen } from '@testing-library/react'
import StarDisplay from '@/components/StarDisplay'

describe('StarDisplay', () => {
  it('shows "Belum ada ulasan" when no ratings exist', () => {
    render(<StarDisplay avgScore={null} totalRatings={0} />)
    expect(screen.getByText(/belum ada ulasan/i)).toBeInTheDocument()
  })

  it('shows "Belum ada ulasan" when totalRatings is 0 even with a score', () => {
    render(<StarDisplay avgScore={4.5} totalRatings={0} />)
    expect(screen.getByText(/belum ada ulasan/i)).toBeInTheDocument()
  })

  it('displays the average score when ratings exist', () => {
    render(<StarDisplay avgScore={4.2} totalRatings={8} />)
    expect(screen.getByText('4.2')).toBeInTheDocument()
  })

  it('displays the total rating count in parentheses', () => {
    render(<StarDisplay avgScore={3.8} totalRatings={12} />)
    expect(screen.getByText('(12)')).toBeInTheDocument()
  })

  it('shows a perfect 5.0 score correctly', () => {
    render(<StarDisplay avgScore={5} totalRatings={3} />)
    expect(screen.getByText('5.0')).toBeInTheDocument()
    expect(screen.getByText('(3)')).toBeInTheDocument()
  })

  it('applies md size class when size="md"', () => {
    const { container } = render(<StarDisplay avgScore={4} totalRatings={5} size="md" />)
    expect(container.querySelector('.text-base')).toBeInTheDocument()
  })

  it('applies sm size class by default', () => {
    const { container } = render(<StarDisplay avgScore={4} totalRatings={5} />)
    expect(container.querySelector('.text-xs')).toBeInTheDocument()
  })
})
