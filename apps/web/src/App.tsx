import { generateId } from '@kairos/utils'

function App() {
  return (
    <div className="app">
      <h1>Project Kairos</h1>
      <p>Welcome to your creative writing workspace!</p>
      <p>Random ID example: {generateId()}</p>
    </div>
  )
}

export default App