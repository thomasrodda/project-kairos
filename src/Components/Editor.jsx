import { db } from '../firebase.js';
import { doc, updateDoc } from 'firebase/firestore';
import '../index.css';
import React from 'react';
import RichTextEditor from './RichTextEditor'

// Editor.jsx serves as the container for the RichTextEditor and manages its content.

const Editor = ({ selectedPage, setPages }) => {
    const handleContentChange = (newContent) => {
        // Update page content in Firestore
        const pageRef = doc(db, "pages", selectedPage.id);
        updateDoc(pageRef, {        
            content: newContent
        }).then(() => {
            // Update local state
            setPages((prevPages) => {
                const updatedPages = prevPages.map((page) => {
                    if (page.id === selectedPage.id) {
                        return { ...page, content: newContent };
                    }
                    return page;
                });
                return updatedPages;
            });
        });
    };
    
    console.log("Editor component rendered with page:", selectedPage);

    return (
        <div id="editor" className="editor h-screen overflow-scroll overflow-x-hidden m-0 flex items-center flex-col p-20 bg-off-black">
            <div className='w-[800px] mb-2'>
                <h2 className="text-pageName font-bold text-left">{selectedPage.name}</h2>
            </div>
            <div>
                <RichTextEditor initialContent={selectedPage.content} onContentChange={handleContentChange} />
            </div>
        </div>
    )
}

export default Editor;