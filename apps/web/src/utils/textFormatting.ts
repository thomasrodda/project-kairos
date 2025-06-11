// apps/web/src/utils/textFormatting.ts
// Core utilities for managing text formatting in the block editor.
// These functions handle applying, removing, and merging text formats while maintaining
// proper position tracking and handling overlapping formats.

import { TextFormat, FormatType } from '../contexts/EditorContext'

// Apply formatting to a range, handling overlaps and merging
export function applyFormat(formats: TextFormat[], start: number, end: number, type: FormatType, url?: string): TextFormat[] {
  // Don't apply format to empty range
  if (start >= end) return formats

  // Find all formats of the same type that overlap or are adjacent to the new range
  let mergedStart = start
  let mergedEnd = end

  const otherFormats: TextFormat[] = []

  for (const format of formats) {
    if (format.type === type && (!url || format.url === url)) {
      // Check if this format overlaps or is adjacent to our range
      if (format.end >= start && format.start <= end) {
        // Expand the merged range
        mergedStart = Math.min(mergedStart, format.start)
        mergedEnd = Math.max(mergedEnd, format.end)
      } else {
        // Keep non-overlapping formats of the same type
        otherFormats.push(format)
      }
    } else {
      // Keep formats of different types
      otherFormats.push(format)
    }
  }

  // Create the new merged format
  const mergedFormat: TextFormat = { start: mergedStart, end: mergedEnd, type }
  if (url) mergedFormat.url = url

  // Add the merged format and sort by start position
  const result = [...otherFormats, mergedFormat].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start
    return a.type.localeCompare(b.type)
  })

  return result
}

// Remove formatting from a range
export function removeFormat(formats: TextFormat[], start: number, end: number, type?: FormatType): TextFormat[] {
  const result: TextFormat[] = []

  for (const format of formats) {
    // Skip if type specified and doesn't match
    if (type && format.type !== type) {
      result.push(format)
      continue
    }

    // No overlap - keep the format
    if (format.end <= start || format.start >= end) {
      result.push(format)
      continue
    }

    // Complete overlap - remove the format
    if (format.start >= start && format.end <= end) {
      continue
    }

    // Partial overlap - split the format
    if (format.start < start && format.end > end) {
      // Format spans the removal range - split into two
      result.push({
        ...format,
        end: start,
      })
      result.push({
        ...format,
        start: end,
      })
    } else if (format.start < start) {
      // Format starts before removal range - trim end
      result.push({
        ...format,
        end: start,
      })
    } else {
      // Format ends after removal range - trim start
      result.push({
        ...format,
        start: end,
      })
    }
  }

  return result
}

// Check if a position has a specific format
export function hasFormat(formats: TextFormat[], position: number, type: FormatType): boolean {
  return formats.some((format) => format.type === type && format.start <= position && format.end > position)
}

// Get all format types at a position
export function getFormatsAtPosition(formats: TextFormat[], position: number): FormatType[] {
  return formats.filter((format) => format.start <= position && format.end > position).map((format) => format.type)
}

// Merge overlapping or adjacent formats of the same type
export function mergeFormats(formats: TextFormat[]): TextFormat[] {
  if (formats.length === 0) return []

  // Sort formats by type and start position
  const sorted = [...formats].sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type)
    return a.start - b.start
  })

  const merged: TextFormat[] = []
  let current = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]

    // If same type and overlapping or adjacent, merge
    if (current.type === next.type && current.url === next.url && current.end >= next.start) {
      current = {
        ...current,
        end: Math.max(current.end, next.end),
      }
    } else {
      merged.push(current)
      current = next
    }
  }

  merged.push(current)
  return merged
}

// Adjust format positions after text changes
export function adjustFormatsAfterEdit(formats: TextFormat[], editStart: number, deleteLength: number, insertLength: number): TextFormat[] {
  const offset = insertLength - deleteLength
  const editEnd = editStart + deleteLength

  return formats
    .map((format) => {
      // Format is completely before the edit - no change
      if (format.end <= editStart) {
        return format
      }

      // Format is completely after the edit - shift by offset
      if (format.start >= editEnd) {
        return {
          ...format,
          start: format.start + offset,
          end: format.end + offset,
        }
      }

      // Format contains the edit range
      if (format.start <= editStart && format.end >= editEnd) {
        return {
          ...format,
          end: format.end + offset,
        }
      }

      // Format is completely within the deleted range - remove it
      if (format.start >= editStart && format.end <= editEnd) {
        return null
      }

      // Format partially overlaps the edit range
      if (format.start < editStart && format.end > editStart && format.end <= editEnd) {
        // Format ends within the deleted range - trim to edit start
        return {
          ...format,
          end: editStart,
        }
      }

      if (format.start >= editStart && format.start < editEnd && format.end > editEnd) {
        // Format starts within the deleted range - adjust start
        return {
          ...format,
          start: editStart + insertLength,
          end: format.end + offset,
        }
      }

      // Shouldn't reach here, but return unchanged
      return format
    })
    .filter((format): format is TextFormat => format !== null)
}

// Split content into segments based on formatting
export interface TextSegment {
  text: string
  formats: FormatType[]
  start: number
  end: number
}

export function splitIntoSegments(content: string, formatting?: TextFormat[]): TextSegment[] {
  if (!formatting || formatting.length === 0) {
    return [
      {
        text: content,
        formats: [],
        start: 0,
        end: content.length,
      },
    ]
  }

  // Create boundary points
  const boundaries = new Set<number>([0, content.length])
  formatting.forEach((format) => {
    boundaries.add(format.start)
    boundaries.add(format.end)
  })

  // Sort boundaries
  const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b)

  // Create segments
  const segments: TextSegment[] = []
  for (let i = 0; i < sortedBoundaries.length - 1; i++) {
    const start = sortedBoundaries[i]
    const end = sortedBoundaries[i + 1]

    if (start >= end) continue

    const formats = formatting.filter((format) => format.start <= start && format.end >= end).map((format) => format.type)

    segments.push({
      text: content.substring(start, end),
      formats: Array.from(new Set(formats)), // Remove duplicates
      start,
      end,
    })
  }

  return segments
}

// Check if a range is fully formatted with a specific format type
export function isRangeFormatted(formats: TextFormat[], start: number, end: number, type: FormatType): boolean {
  // Find all formats of the specified type
  const relevantFormats = formats.filter((f) => f.type === type)

  // Sort by start position
  const sorted = relevantFormats.sort((a, b) => a.start - b.start)

  // Check if the formats cover the entire range
  let covered = start
  for (const format of sorted) {
    if (format.start > covered) return false
    covered = Math.max(covered, format.end)
    if (covered >= end) return true
  }

  return covered >= end
}

// Toggle format for a range
export function toggleFormat(formats: TextFormat[], start: number, end: number, type: FormatType, url?: string): TextFormat[] {
  if (isRangeFormatted(formats, start, end, type)) {
    return removeFormat(formats, start, end, type)
  } else {
    return applyFormat(formats, start, end, type, url)
  }
}
