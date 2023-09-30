import { db } from '../firebase.js';
import { doc, updateDoc } from 'firebase/firestore';
import '../index.css';
import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../UserContext.jsx';
import RichTextEditor from './RichTextEditor'

const Editor = ({ selectedPage, setPages, selectedWorkspaceId }) => {
    const user = useContext(UserContext);  // Get the current user

    console.log("Current user in Editor:", user);  // Log current user for debugging
    console.log("SelectedPage in Editor:", selectedPage);
    const [currentContent, setCurrentContent] = useState(selectedPage ? selectedPage.content : "");
    const [debouncedContent, setDebouncedContent] = useState(selectedPage.content);

    let timerId;  // Declare timerId outside of useEffect

    const handleContentChange = (newContent) => {
        console.log("handleContentChange triggered");
        setCurrentContent(newContent); // Update real-time content
        setDebouncedContent(newContent); // Update debounced content
    };

    useEffect(() => {
        console.log("First useEffect triggered");
        setCurrentContent(selectedPage.content);
        setDebouncedContent(selectedPage.content);
    }, [selectedPage]);

    // Saves content automatically when user inactive
    useEffect(() => {
        console.log("Second useEffect triggered");

        // Debug: Log the values to check for undefined
        console.log("Debug Values (Explicit):", {
            "user.uid": user?.uid || "user.uid is undefined",
            "selectedWorkspaceId": selectedWorkspaceId || "selectedWorkspaceId is undefined",
            "selectedPage.id": selectedPage?.id || "selectedPage.id is undefined",
        });

        timerId = setTimeout(() => {
            console.log("Inside setTimeout")
            // Make sure to include the full path to the page in Firestore
            const pageRef = doc(db, 'users', user.uid, 'workspaces', selectedWorkspaceId, 'pages', selectedPage.id);
            updateDoc(pageRef, { content: debouncedContent }).then(() => {
                console.log("Firestore update successful");
                setPages((prevPages) => {
                    const updatedPages = prevPages.map((page) => {
                        if (page.id === selectedPage.id) {
                            return { ...page, content: debouncedContent };
                        }
                        return page;
                    });
                    return updatedPages;
                });
            });
        }, 1000); // User inactivity time /ms

        return () => {
            clearTimeout(timerId);
        };
    }, [debouncedContent]);

    return (
        <div id="editor" className="editor h-screen overflow-scroll overflow-x-hidden m-0 flex items-center flex-col p-20 bg-off-black">
            <div className='w-[800px] mb-2'>
                <h2 className="text-pageName font-bold text-left">{selectedPage.name}</h2>
            </div>
            <div>
                <RichTextEditor initialContent={currentContent} onContentChange={handleContentChange} />
            </div>
        </div>
    );
}

export default Editor;
