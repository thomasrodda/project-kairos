import React, { useState, useEffect } from 'react'
import { Icon } from '@kairos/ui'
import './StyleGuide.scss'

type Category = 'tokens' | 'typography' | 'buttons' | 'forms' | 'cards' | 'layout' | 'colors' | 'spacing'

interface StyleExampleProps {
  title: string
  description?: string
  filePath?: string
  previewClassName?: string
  children: React.ReactNode
}

const StyleExample: React.FC<StyleExampleProps> = ({ title, description, filePath, previewClassName, children }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyPath = () => {
    if (filePath) {
      navigator.clipboard.writeText(filePath)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="style-example">
      <div className="style-example__header">
        <h3 className="style-example__title">{title}</h3>
        {filePath && (
          <div className="style-example__path-container">
            <code className="style-example__path" title="Source file">
              {filePath}
            </code>
            <button className="style-example__copy-btn" onClick={handleCopyPath} title={copied ? 'Copied!' : 'Copy file path'}>
              <Icon name={copied ? 'check' : 'copy'} size={14} />
            </button>
          </div>
        )}
      </div>
      {description && <p className="style-example__description">{description}</p>}
      <div className={`style-example__preview${previewClassName ? ` style-example__${previewClassName}` : ''}`}>{children}</div>
    </div>
  )
}

interface StyleGuideProps {
  onClose?: () => void
}

export const StyleGuide: React.FC<StyleGuideProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('tokens')

  // Handle ESC key to close
  useEffect(() => {
    if (!onClose) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const categories: { value: Category; label: string }[] = [
    { value: 'tokens', label: 'Design Tokens' },
    { value: 'colors', label: 'Colors' },
    { value: 'spacing', label: 'Spacing' },
    { value: 'typography', label: 'Typography' },
    { value: 'buttons', label: 'Buttons' },
    { value: 'forms', label: 'Forms' },
    { value: 'cards', label: 'Cards' },
    { value: 'layout', label: 'Layout' },
  ]

  return (
    <div className="style-guide">
      <header className="style-guide__header">
        <div className="style-guide__header-content">
          <div>
            <h1 className="style-guide__title">Project Kairos Style Guide</h1>
            <p className="style-guide__subtitle">Visual reference for components, tokens, and styling patterns</p>
          </div>
          {onClose && (
            <button className="style-guide__close" onClick={onClose} title="Close (Esc)">
              <Icon name="close" size={24} />
            </button>
          )}
        </div>
      </header>

      <nav className="style-guide__nav">
        <div className="style-guide__nav-content">
          {categories.map(({ value, label }) => (
            <button
              key={value}
              className={`style-guide__nav-item ${activeCategory === value ? 'style-guide__nav-item--active' : ''}`}
              onClick={() => setActiveCategory(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="style-guide__content">
        {activeCategory === 'tokens' && (
          <section className="style-guide__section">
            <h2>Design Tokens</h2>
            <p>Core design tokens that power the design system</p>
            {/* Token examples will go here */}
          </section>
        )}

        {activeCategory === 'colors' && (
          <section className="style-guide__section">
            <h2>Colors</h2>
            <p>Color palette and semantic color tokens</p>
            {/* Color examples will go here */}
          </section>
        )}

        {activeCategory === 'spacing' && (
          <section className="style-guide__section">
            <h2>Spacing</h2>
            <p>Spacing scale for consistent layouts</p>

            <StyleExample
              title="Spacing Scale"
              description="Use these tokens for consistent spacing throughout the app"
              filePath="packages/design-tokens/src/_spacing.scss"
            >
              <div className="spacing-examples">
                {[
                  { token: '--spacing-2', value: '2px', label: 'Hairline' },
                  { token: '--spacing-4', value: '4px', label: 'Minimal' },
                  { token: '--spacing-8', value: '8px', label: 'Tight' },
                  { token: '--spacing-12', value: '12px', label: 'Snug' },
                  { token: '--spacing-16', value: '16px', label: 'Default' },
                  { token: '--spacing-24', value: '24px', label: 'Comfortable' },
                  { token: '--spacing-32', value: '32px', label: 'Spacious' },
                  { token: '--spacing-48', value: '48px', label: 'Generous' },
                ].map(({ token, value, label }) => (
                  <div key={token} className="spacing-example">
                    <div className="spacing-example__info">
                      <code>{token}</code>
                      <span className="spacing-example__value">{value}</span>
                      <span className="spacing-example__label">{label}</span>
                    </div>
                    <div className="spacing-example__visual" style={{ width: `var(${token})` }} />
                  </div>
                ))}
              </div>
            </StyleExample>
          </section>
        )}

        {activeCategory === 'typography' && (
          <section className="style-guide__section">
            <h2>Typography</h2>
            <p>Text styles and typography scale</p>

            <StyleExample
              title="Font Family"
              description="Inter is our primary typeface, chosen for its excellent readability and modern appearance"
              filePath="packages/design-tokens/src/_typography.scss"
              previewClassName="preview-lg"
            >
              <div className="typography-font-info">
                <div className="typography-font-sample">
                  <h3>Inter</h3>
                  <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                  <p>abcdefghijklmnopqrstuvwxyz</p>
                  <p>0123456789</p>
                  <p className="typography-font-weights">
                    <span style={{ fontWeight: 300 }}>Light</span>
                    <span style={{ fontWeight: 400 }}>Regular</span>
                    <span style={{ fontWeight: 500 }}>Medium</span>
                    <span style={{ fontWeight: 600 }}>Semibold</span>
                    <span style={{ fontWeight: 700 }}>Bold</span>
                  </p>
                </div>
                <div className="typography-font-description">
                  <p>
                    Inter is a variable font designed for computer screens, with a focus on high legibility. Its tall x-height and open apertures make
                    it perfect for both UI and long-form text.
                  </p>
                  <code>--font-family-primary: &apos;Inter&apos;, system-ui, sans-serif</code>
                </div>
              </div>
            </StyleExample>

            <StyleExample
              title="Heading Styles"
              description="Semantic heading sizes for consistent hierarchy"
              filePath="packages/design-tokens/src/_semantic-typography.scss"
            >
              <div className="typography-examples">
                {[
                  { token: '--text-heading-2xl', size: '36px', weight: 'Bold', line: '1.25', label: 'Heading 2XL' },
                  { token: '--text-heading-xl', size: '30px', weight: 'Bold', line: '1.25', label: 'Heading XL' },
                  { token: '--text-heading-lg', size: '24px', weight: 'Bold', line: '1.25', label: 'Heading LG' },
                  { token: '--text-heading-md', size: '20px', weight: 'Bold', line: '1.375', label: 'Heading MD' },
                  { token: '--text-heading-sm', size: '18px', weight: 'Bold', line: '1.375', label: 'Heading SM' },
                  { token: '--text-heading-xs', size: '16px', weight: 'Bold', line: '1.375', label: 'Heading XS' },
                ].map(({ token, size, weight, line, label }) => (
                  <div key={token} className="typography-example">
                    <div className="typography-example__info">
                      <code>{token}</code>
                      <span className="typography-example__specs">
                        {size} / {weight} / Line {line}
                      </span>
                    </div>
                    <div className="typography-example__preview" style={{ font: `var(${token})` }}>
                      {label} - The quick brown fox jumps over the lazy dog
                    </div>
                  </div>
                ))}
              </div>
            </StyleExample>

            <StyleExample
              title="Body Text Styles"
              description="Standard text sizes for content and UI"
              filePath="packages/design-tokens/src/_semantic-typography.scss"
            >
              <div className="typography-examples">
                {[
                  { token: '--text-body-lg', size: '18px', line: '1.625', label: 'Body Large' },
                  { token: '--text-body-md', size: '16px', line: '1.625', label: 'Body Medium' },
                  { token: '--text-body-sm', size: '14px', line: '1.45', label: 'Body Small' },
                  { token: '--text-caption', size: '12px', line: '1.45', label: 'Caption' },
                ].map(({ token, size, line, label }) => (
                  <div key={token} className="typography-example">
                    <div className="typography-example__info">
                      <code>{token}</code>
                      <span className="typography-example__specs">
                        {size} / Regular / Line {line}
                      </span>
                    </div>
                    <div className="typography-example__preview" style={{ font: `var(${token})` }}>
                      {label} - The quick brown fox jumps over the lazy dog. This is a sample of how this text style looks in a longer paragraph
                      format.
                    </div>
                  </div>
                ))}
              </div>
            </StyleExample>

            <StyleExample
              title="UI Text Styles"
              description="Specialized styles for interface elements"
              filePath="packages/design-tokens/src/_semantic-typography.scss"
            >
              <div className="typography-examples">
                {[
                  { token: '--text-ui-label-lg', size: '16px', weight: 'Medium', label: 'UI Label Large' },
                  { token: '--text-ui-label-md', size: '14px', weight: 'Medium', label: 'UI Label Medium' },
                  { token: '--text-button', size: '14px', weight: 'Regular', label: 'Button Text' },
                  { token: '--text-label', size: '14px', weight: 'Regular', label: 'Form Label' },
                ].map(({ token, size, weight, label }) => (
                  <div key={token} className="typography-example">
                    <div className="typography-example__info">
                      <code>{token}</code>
                      <span className="typography-example__specs">
                        {size} / {weight}
                      </span>
                    </div>
                    <div className="typography-example__preview" style={{ font: `var(${token})` }}>
                      {label} - BUTTON TEXT EXAMPLE
                    </div>
                  </div>
                ))}
              </div>
            </StyleExample>
          </section>
        )}

        {activeCategory === 'buttons' && (
          <section className="style-guide__section">
            <h2>Buttons</h2>
            <p>Button components and variants</p>
            {/* Button examples will go here */}
          </section>
        )}

        {activeCategory === 'forms' && (
          <section className="style-guide__section">
            <h2>Form Elements</h2>
            <p>Input fields, textareas, and form controls</p>
            {/* Form examples will go here */}
          </section>
        )}

        {activeCategory === 'cards' && (
          <section className="style-guide__section">
            <h2>Cards</h2>
            <p>Card components for content containers</p>
            {/* Card examples will go here */}
          </section>
        )}

        {activeCategory === 'layout' && (
          <section className="style-guide__section">
            <h2>Layout</h2>
            <p>Layout utilities and grid systems</p>
            {/* Layout examples will go here */}
          </section>
        )}
      </main>
    </div>
  )
}
