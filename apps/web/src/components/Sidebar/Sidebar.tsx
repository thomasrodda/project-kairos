import { useState } from 'react'
import './Sidebar.scss'

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <aside className={`sidebar ${isExpanded ? '' : 'sidebar--collapsed'}`}>
      <div className="sidebar__header">
        <button
          className="sidebar__toggle"
          onClick={toggleExpanded}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? '←' : '→'}
        </button>
      </div>
      <div className="sidebar__content">
        {/* File tree, workspace selector, etc. will go here */}
      </div>
    </aside>
  )
}
