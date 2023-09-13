import logo from './favicon.ico';
import './App.css';
import SideBar from './Components/SideBar';
import Editor from './Components/Editor';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CreatePage from './Components/CreatePage';

// App.jsx serves as the entry point for the Kairos app, managing state and rendering major components.

function App() {

  /*Page Creation*/
  const [pages, setPages] = useState(() => {
    const savedPages = localStorage.getItem('pages');
    if (savedPages) {
      return JSON.parse(savedPages);
    } else {
      return [{ id: uuidv4(), name: 'Default Page', content: '' }];
    }
  });

  const [selectedPageId, setSelectedPageId] = useState(pages[0].id);

  const [showPopup, setShowPopup] = useState(false);

  const selectedPage = pages.find(page => page.id === selectedPageId);
  //console.log("Selected Page:", JSON.stringify(selectedPage));

  const createPage = (pageName) => {
    const newPage = { id: uuidv4(), name: pageName, content: '' };
    setPages((prevPages) => {
      const newPages = [...prevPages, newPage];
      localStorage.setItem('pages', JSON.stringify(newPages));  // Save pages to local storage
      return newPages;
    });
  };

  /*Displayed App*/
  return (
    <div className="App flex h-screen overflow-hidden">
      <div className="fixed w-60 h-screen overflow-auto">
      <SideBar createPage={() => setShowPopup(true)} pages={pages} selectedPageId={selectedPageId} setSelectedPageId={setSelectedPageId}/>
      </div>
      <div className="flex-grow overflow-auto ml-60">
        <Editor selectedPageId={selectedPageId} pages={pages} setPages={setPages} selectedPage={selectedPage}/>
      </div>
      {showPopup && <div className="backdrop"></div>}
      {showPopup && <CreatePage createPage={createPage} closePopup={() => setShowPopup(false)} />}
    </div>
  );
}


export default App;
