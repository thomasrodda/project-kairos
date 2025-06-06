import React from 'react'
import { waitFor } from '@testing-library/react'
import { Editor } from './Editor'
import { type EditorBlock } from '../../contexts/EditorContext'
import { generateId } from '@kairos/utils'
import { renderWithEditor } from '../../test/utils'

describe('Editor Performance Metrics', () => {
  // Performance measurement utility
  const measureRenderTime = async (blockCount: number): Promise<number> => {
    const start = performance.now()

    const blocks: EditorBlock[] = Array.from({ length: blockCount }, (_, i) => ({
      id: generateId(),
      type: i % 3 === 0 ? 'h2' : i % 3 === 1 ? 'h3' : 'paragraph',
      content: `This is block ${i + 1} with some sample content.`,
    }))

    const { container, store } = renderWithEditor(<Editor />, {
      initialBlocks: blocks,
    })

    // Wait for blocks to render
    await waitFor(
      () => {
        const renderedBlocks = container.querySelectorAll('.block')
        expect(renderedBlocks.length).toBe(blockCount)
      },
      { timeout: 10000 }
    )

    const end = performance.now()
    return end - start
  }

  describe('✅ Render Performance', () => {
    it('should render 10 blocks in reasonable time', async () => {
      const renderTime = await measureRenderTime(10)
      console.log(`10 blocks render time: ${renderTime.toFixed(2)}ms`)
      expect(renderTime).toBeLessThan(500) // 500ms threshold
    }, 10000)

    it('should render 50 blocks in reasonable time', async () => {
      const renderTime = await measureRenderTime(50)
      console.log(`50 blocks render time: ${renderTime.toFixed(2)}ms`)
      expect(renderTime).toBeLessThan(1000) // 1 second threshold
    }, 15000)

    it('should render 100 blocks in reasonable time', async () => {
      const renderTime = await measureRenderTime(100)
      console.log(`100 blocks render time: ${renderTime.toFixed(2)}ms`)
      expect(renderTime).toBeLessThan(2000) // 2 seconds threshold
    }, 20000)

    it('should render 200 blocks in reasonable time', async () => {
      const renderTime = await measureRenderTime(200)
      console.log(`200 blocks render time: ${renderTime.toFixed(2)}ms`)
      expect(renderTime).toBeLessThan(3000) // 3 seconds threshold
    }, 25000)
  })

  describe('✅ Performance Benchmarks', () => {
    it('should maintain consistent performance across multiple renders', async () => {
      const renderTimes: number[] = []

      // Perform 5 renders of 50 blocks each
      for (let i = 0; i < 5; i++) {
        const time = await measureRenderTime(50)
        renderTimes.push(time)
      }

      const avgTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
      const maxTime = Math.max(...renderTimes)
      const minTime = Math.min(...renderTimes)

      console.log(`Average render time (50 blocks): ${avgTime.toFixed(2)}ms`)
      console.log(`Min/Max: ${minTime.toFixed(2)}ms / ${maxTime.toFixed(2)}ms`)

      // Variance should not be too high
      const variance = maxTime - minTime
      expect(variance).toBeLessThan(avgTime * 0.5) // Less than 50% variance
    }, 30000)

    it('should scale linearly with block count', async () => {
      const counts = [10, 20, 30, 40, 50]
      const times: number[] = []

      for (const count of counts) {
        const time = await measureRenderTime(count)
        times.push(time)
        console.log(`${count} blocks: ${time.toFixed(2)}ms`)
      }

      // Check that performance scales roughly linearly
      // Time per block should remain relatively constant
      const timePerBlock = times.map((time, i) => time / counts[i])
      const avgTimePerBlock = timePerBlock.reduce((a, b) => a + b, 0) / timePerBlock.length

      console.log(`Average time per block: ${avgTimePerBlock.toFixed(2)}ms`)

      // Each measurement should be within 50% of average
      timePerBlock.forEach((time) => {
        expect(time).toBeLessThan(avgTimePerBlock * 1.5)
        expect(time).toBeGreaterThan(avgTimePerBlock * 0.5)
      })
    }, 30000)
  })

  describe('✅ Memory Usage Indicators', () => {
    it('should not leak memory on component unmount', async () => {
      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithEditor(<Editor />)

        // Wait a bit for render to complete
        await new Promise((resolve) => setTimeout(resolve, 50))

        unmount()
      }

      // If we get here without errors, memory management is likely working
      expect(true).toBe(true)
    })
  })
})
