import '../index.css';
import React from 'react';
import RichTextEditor from './RichTextEditor'

// Editor.jsx serves as the container for the RichTextEditor and manages its content.

const Editor = ({ selectedPage, setPages }) => {
    const handleContentChange = (newContent) => {
        //console.log("Editor received new content:", newContent);
        //console.log("Content before saving:", newContent);
        setPages((prevPages) => {
            const updatedPages = prevPages.map((page) => {
                if (page.id === selectedPage.id) {
                    return { ...page, content: newContent };
                }
                return page;
            });
            localStorage.setItem('pages', JSON.stringify(updatedPages));
            //console.log("Content after saving:", newContent);
            return updatedPages;
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