import logo from './favicon.ico';
import './App.css';
import SideBar from './Components/SideBar';
import Editor from './Components/Editor';

function App() {
  return (
    <div className="App flex h-screen overflow-hidden">
      <div className="fixed w-60 h-screen overflow-auto">
        <SideBar />
      </div>
      <div className="flex-grow overflow-auto ml-60">
        <Editor />
      </div>
    </div>
  );
}

export default App;