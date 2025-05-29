import { Sidebar } from '../Sidebar'
import { Editor } from '../Editor'
import './Workspace.scss'

export function Workspace() {
  return (
    <div className="workspace">
      <Sidebar />
      <Editor />
    </div>
  )
}
