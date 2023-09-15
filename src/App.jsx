import { db } from './firebase.js';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import './App.css';
import SideBar from './Components/SideBar';
import Editor from './Components/Editor';
import React, { useState, useEffect } from 'react';
import CreatePage from './Components/CreatePage';

// App.jsx serves as the entry point for the Kairos app, managing state and rendering major components.

function App() {

  // Initialize pages state
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Fetch pages from Firestore when component mounts
  useEffect(() => {
    getDocs(collection(db, 'pages')).then((querySnapshot) => {
      const pagesData = [];
      querySnapshot.forEach((doc) => {
        pagesData.push({ id: doc.id, ...doc.data() });
      });
      setPages(pagesData);
      if (pagesData.length > 0) {
        setSelectedPageId(pagesData[0].id);
        console.log("SelectedPageId set to:", pagesData[0].id);
    }
    });
  }, []); // Empty dependency array means this useEffect runs once when the component mounts

  const selectedPage = pages.find(page => page.id === selectedPageId);
  //console.log("Selected Page:", JSON.stringify(selectedPage));

  const createPage = (pageName) => {
    const newPageRef = doc(db, "pages");
    setDoc(newPageRef, {
      id: newPageRef.id,
      name: pageName,
      content: ''
    }).then(() => {
      setPages([...pages, { id: newPageRef.id, name: pageName, content: '' }]);
    });
  };

  /*Displayed App*/
  return (
    <div className="App flex h-screen overflow-hidden">
      <div className="fixed w-60 h-screen overflow-auto">
      <SideBar createPage={() => setShowPopup(true)} pages={pages} selectedPageId={selectedPageId} setSelectedPageId={setSelectedPageId}/>
      </div>
      <div className="flex-grow overflow-auto ml-60">
        {selectedPage && <Editor selectedPageId={selectedPageId} pages={pages} setPages={setPages} selectedPage={selectedPage} />}
      </div>
      {showPopup && <div className="backdrop"></div>}
      {showPopup && <CreatePage createPage={createPage} closePopup={() => setShowPopup(false)} />}
    </div>
  );
}


export default App;
