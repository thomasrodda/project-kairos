import { db } from './firebase.js';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import './App.css';
import Login from './Components/Login';
import { UserProvider } from './UserContext';
import SideBar from './Components/SideBar';
import Editor from './Components/Editor';
import React, { useState, useEffect } from 'react';
import CreatePage from './Components/CreatePage';
import MainMenu from './Components/MainMenu';
import WorkspaceSelection from './Components/WorkspaceSelection';
import CreateWorkspace from './Components/CreateWorkspace';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// App.jsx serves as the entry point for the Kairos app, managing state and rendering major components.

function App() {

  // Initialize pages state
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pages from Firestore when component mounts
  useEffect(() => {
    getDocs(collection(db, 'pages')).then((querySnapshot) => {
      const pagesData = [];
      querySnapshot.forEach((doc) => {
        pagesData.push({ id: doc.id, ...doc.data() });
      });
      setPages(pagesData);
      console.log("Fetched pages:", pagesData);
      setSelectedPageId(prevSelectedPageId => {
        console.log("Previous SelectedPageId:", prevSelectedPageId);  // <-- Add this line
        return pagesData[0].id;
      });
      setIsLoading(false);
    });
  }, []); // Empty dependency array means this useEffect runs once when the component mounts

  useEffect(() => {
    const newSelectedPage = pages.find(page => page.id === selectedPageId);
    setSelectedPage(newSelectedPage);
    console.log("SelectedPage set to:", newSelectedPage);
  }, [selectedPageId, pages]);  
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

  // Main App
  const RenderApp = () => {
    return (
      <div className="App flex h-screen overflow-hidden">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="fixed w-60 h-screen overflow-auto">
              <SideBar createPage={() => setShowPopup(true)} pages={pages} selectedPageId={selectedPageId} setSelectedPageId={setSelectedPageId}/>
            </div>
            <div className="flex-grow overflow-auto ml-60">
              {selectedPage && <Editor selectedPageId={selectedPageId} pages={pages} setPages={setPages} selectedPage={selectedPage} />}
            </div>
            {showPopup && <div className="backdrop"></div>}
            {showPopup && <CreatePage createPage={createPage} closePopup={() => setShowPopup(false)} />}
          </>
        )}
      </div>
    );
  };

  // App Routes
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/login" element={<Login />} />
          <Route path="/workspace-selection" element={<WorkspaceSelection />} />
          <Route path="/create-workspace" element={<CreateWorkspace />} />
          <Route path="/app" element={RenderApp()} />
        </Routes>
      </Router>
    </UserProvider>
  );  
}

export default App;
