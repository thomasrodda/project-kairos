// Import required modules and components
import { db } from '../firebase.js';
import { doc, updateDoc } from 'firebase/firestore';
import '../index.css';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { UserContext } from '../UserContext.jsx';
import RichTextEditor from './RichTextEditor'

// Editor component definition
const Editor = ({ selectedPage, setPages, selectedWorkspaceId }) => {

    // Declare states and context
    const { user } = useContext(UserContext);  // Get the current user and destructure it
    const timerIdRef = useRef(null); // Declare timerIdRef
    const focusEditor = useRef(null);  // Create a ref to hold the focusEditor function
    console.log("Current user in Editor:", user);  // Log current user for debugging
    console.log("SelectedPage in Editor:", selectedPage);
    const [currentContent, setCurrentContent] = useState(selectedPage ? selectedPage.content : "");
    const [debouncedContent, setDebouncedContent] = useState(selectedPage ? selectedPage.content : "");

    // Function to handle content change
    const handleContentChange = (newContent) => {
        console.log("handleContentChange triggered");
        setCurrentContent(newContent); // Update real-time content
        setDebouncedContent(newContent); // Update debounced content
    };

    // useEffect to initialize content when a new page is selected
    useEffect(() => {
        console.log("First useEffect triggered");
        if (selectedPage) {
            setCurrentContent(selectedPage.content);
            setDebouncedContent(selectedPage.content);
        }
    }, [selectedPage]);

    // useEffect to handle auto-saving of content
    useEffect(() => {

        console.log("Second useEffect triggered");

        // Debug: Log the values to check for undefined
        console.log("Debug Values (Explicit):", {
            "user.uid": user?.uid || "user.uid is undefined",
            "selectedWorkspaceId": selectedWorkspaceId || "selectedWorkspaceId is undefined",
            "selectedPage.id": selectedPage?.id || "selectedPage.id is undefined",
        });

        if (user && selectedWorkspaceId && selectedPage) {
            // Only proceed if debouncedContent has actually changed
            if (debouncedContent !== selectedPage.content) {
                timerIdRef.current = setTimeout(() => { // Use timerIdRef.current
                    console.log("Inside setTimeout")
                    // Full path to the page in Firestore
                    const pageRef = doc(db, 'users', user.uid, 'workspaces', selectedWorkspaceId, 'pages', selectedPage.id);

                    updateDoc(pageRef, { content: debouncedContent }).then(() => {
                        console.log("Firestore update successful");
                        focusEditor();  // Focus the editor here
                        setPages((prevPages) => {
                            return prevPages.map((page) => {
                                if (page.id === selectedPage.id) {
                                    return { ...page, content: debouncedContent };
                                }
                                return page;
                            });
                        });
                    }).catch((error) => {
                        console.error("Failed to update Firestore:", error);
                    });
                }, 1000); // User inactivity time /ms
            }
        } else {
            console.log("One of the required fields is undefined. Halting operation.");
        }

        return () => {
            clearTimeout(timerIdRef.current); // Clear the timer using timerIdRef.current
        };
    }, [debouncedContent, user, selectedWorkspaceId, selectedPage, setPages]);

    // Render the editor
    return (
        <div id="editor" className="editor h-screen overflow-scroll overflow-x-hidden m-0 flex items-center flex-col p-20 bg-off-black">
            <div className='w-[800px] mb-2'>
                <h2 className="text-pageName font-bold text-left">{selectedPage.name}</h2>
            </div>
            <div>
                <RichTextEditor initialContent={currentContent} onContentChange={handleContentChange} focusEditor={focusEditor} />
            </div>
        </div>
    );
}

export default Editor;
