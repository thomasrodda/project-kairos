// Import required modules, components, and Firebase functions
import { db } from './firebase.js';
import { collection, getDocs, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import './App.css';
import Login from './Components/Login';
import { UserContext } from './UserContext';
import SideBar from './Components/SideBar';
import Editor from './Components/Editor';
import React, { useState, useEffect, useContext } from 'react';
import CreatePage from './Components/CreatePage';
import MainMenu from './Components/MainMenu';
import WorkspaceSelection from './Components/WorkspaceSelection';
import CreateWorkspace from './Components/CreateWorkspace';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Entry point for the Kairos app, managing state and rendering major components.
function App() {

  // State variables for managing pages, selected pages, popups, and loading status
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setSelectedWorkspaceId, selectedWorkspaceId, user } = useContext(UserContext);

  // Asynchronous function to save selected workspace ID to Firebase
  const saveWorkspaceIdToFirebase = async (workspaceId, userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { selectedWorkspaceId: workspaceId });
    } catch (error) {
      console.error("Failed to save workspace ID to Firebase:", error);
    }
  };

  // Fetch the selectedWorkspaceId from Firebase when the user logs in
  useEffect(() => {
    const fetchWorkspaceIdFromFirebase = async (userId) => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      if (userData && userData.selectedWorkspaceId) {
        setSelectedWorkspaceId(userData.selectedWorkspaceId);
      }
    };

    if (user && user.uid) {
      fetchWorkspaceIdFromFirebase(user.uid);
    }
  }, [user, setSelectedWorkspaceId]); // This effect runs when the user object changes

  // Fetch pages from Firestore when component mounts and update loading status
  useEffect(() => {
    // This effect fetches pages and sets the loading state
    // Check if a workspace is selected and if the user is authenticated
    if (selectedWorkspaceId && user && user.uid) {
      const pagesRef = collection(db, 'users', user.uid, 'workspaces', selectedWorkspaceId, 'pages');
      
      getDocs(pagesRef).then((querySnapshot) => {
        const pagesData = [];
        querySnapshot.forEach((doc) => {
          pagesData.push({ id: doc.id, ...doc.data() });
        });
        setPages(pagesData);
        
        setSelectedPageId(prevSelectedPageId => {
          if (pagesData.length > 0) {
            return pagesData[0].id;
          }
          return null;
        }); 
      }).finally(() => {
        setIsLoading(false);  // Set isLoading to false after fetching, regardless of success or failure
      });
    } else {
      setIsLoading(false);  // Set isLoading to false because either user or workspace is missing
    }
  }, [selectedWorkspaceId, user]); // This effect runs when either selectedWorkspaceId or user changes

  // Save selectedWorkspaceId to Firebase when it changes
  useEffect(() => {
    // This effect saves the selectedWorkspaceId to Firebase
    if (selectedWorkspaceId && user && user.uid) {
      saveWorkspaceIdToFirebase(selectedWorkspaceId, user.uid);
    }
  }, [selectedWorkspaceId, user]); // This effect runs when either selectedWorkspaceId or user changes

  // Update selectedPage state when selectedPageId changes
  useEffect(() => {
    const newSelectedPage = pages.find(page => page.id === selectedPageId);
    setSelectedPage(newSelectedPage);
    console.log("SelectedPage set to:", newSelectedPage);
  }, [selectedPageId, pages]);  
  //console.log("Selected Page:", JSON.stringify(selectedPage));

  // Asynchronous function to create a new page in Firebase
  const createPage = async (pageName) => {
    // Ensure the Firestore reference includes user ID and workspace ID
    const pagesCollection = collection(db, 'users', user.uid, 'workspaces', selectedWorkspaceId, 'pages');

    // Create the new page
    const newPageRef = await addDoc(pagesCollection, {
      name: pageName,
      content: ''
    });
    
    setPages([...pages, { id: newPageRef.id, name: pageName, content: '' }]);
  };

  // Main rendering logic for the app
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
              {selectedPage && <Editor selectedPageId={selectedPageId} pages={pages} setPages={setPages} selectedPage={selectedPage} selectedWorkspaceId={selectedWorkspaceId} />}
            </div>
            {showPopup && <div className="backdrop"></div>}
            {showPopup && <CreatePage createPage={createPage} closePopup={() => setShowPopup(false)} />}
          </>
        )}
      </div>
    );
  };

  // Routing setup for different views in the app
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/workspace-selection" element={<WorkspaceSelection />} />
        <Route path="/create-workspace" element={<CreateWorkspace />} />
        <Route path="/app" element={<RenderApp />} />
      </Routes>
    </Router>
  );
}

export default App;
