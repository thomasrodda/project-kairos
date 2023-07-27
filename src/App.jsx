import logo from './favicon.ico';
import './App.css';
import SideBar from './Components/SideBar';
import Editor from './Components/Editor';
import PageList from './Components/PageList';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [pages, setPages] = useState([{ id: uuidv4(), name: 'Default Page', content: '' }]);

  const createPage = () => {
    const newPage = { id: uuidv4(), name: 'Untitled Page', content: '' };
    setPages(prevPages => [...prevPages, newPage]);
  }

  return (
    <div className="App flex h-screen overflow-hidden">
      <div className="fixed w-60 h-screen overflow-auto">
        <SideBar createPage={createPage} pages={pages} />
      </div>
      <div className="flex-grow overflow-auto ml-60">
        <Editor />
      </div>
    </div>
  );
}

export default App;
