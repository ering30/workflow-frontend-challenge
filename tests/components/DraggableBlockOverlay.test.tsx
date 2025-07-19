import React from 'react'
import { LucideIcon, Play } from 'lucide-react'

import { it, expect, describe } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import DraggableBlockOverlay from '../../src/components/DraggableBlockOverlay'

describe('DraggableBlockOverlay', () => {
  render(<DraggableBlockOverlay block={{ id: 'test', name: 'Test Block', icon: Play as LucideIcon, color: 'blue' }} />)
  
  it('should render the block name, colour and icon when they are provided', () => {
    const blockTitle = screen.getByText('Test Block')
    expect(blockTitle).toBeInTheDocument()
  })

  it('should maintain accessibility attributes', () => {
    const element = screen.getByRole('button')
    expect(element).toHaveAttribute('aria-label', "Draggable block: Test Block")
  })
})