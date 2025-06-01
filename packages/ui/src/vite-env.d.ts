/// <reference types="vite/client" />

// Declare module types for SVG imports with ?raw
declare module '*.svg?raw' {
  const content: string
  export default content
}

// Also declare regular SVG imports
declare module '*.svg' {
  const content: string
  export default content
}
