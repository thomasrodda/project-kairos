import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import './quill.bubble.css'; // import styles
import ai_icon from '../Images/ai_icon.svg'

// RichTextEditor.jsx integrates the Quill.js editor and manages its features.

const RichTextEditor = ({ initialContent, onContentChange }) => {
  const quillRef = useRef(null); // To store the ReactQuill element reference

  const handleChange = (editorContent) => {
    onContentChange(editorContent);
  };

  // Configuration object for the Quill.js toolbar.
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'], // Toggled buttons
      ['blockquote', 'code-block'],
  
      [{ 'header': ['1', '2', '3', '4', false] }], // Dropdown for headers and body text
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      //[{ 'script': 'sub'}, { 'script': 'super' }], // Superscript/subscript
      [{ 'align': [] }], // Text alignment
  
      ['clean'] // Remove formatting button
    ],
  };
  

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule('toolbar');

      // Check if button already exists to prevent duplicate buttons
      if (!document.querySelector('.ql-aiAssistant')) {
        // Add custom button
        const aiButton = document.createElement('button');
        aiButton.className = 'ql-aiAssistant';
        aiButton.innerHTML = `<img src="${ai_icon}" alt="AI Assistant" />`;
        toolbar.container.appendChild(aiButton);

        // Add event listener to custom button
        aiButton.addEventListener('click', () => {
          console.log('AI Assistant clicked');
          // Add your future AI logic here
        });
      }

      quill.on('selection-change', function (range, oldRange, source) {
        if (range) {
          const tooltip = document.querySelector('.ql-tooltip');
          if (tooltip) {
            const editorBounds = document.querySelector('.ql-editor').getBoundingClientRect();
            const tooltipBounds = tooltip.getBoundingClientRect();

            if (tooltipBounds.right > editorBounds.right) {
              const difference = tooltipBounds.right - editorBounds.right;
              tooltip.style.left = `${tooltipBounds.left - difference}px`;
            }
            // Add similar logic for other boundaries and the sidebar
          }
        }
      });

      // Cleanup event listener when the component unmounts
      return () => {
        const aiButton = document.querySelector('.ql-aiAssistant');
        if (aiButton) {
          aiButton.removeEventListener('click', () => {
            console.log('AI Assistant clicked');
          });
        }
      };
    }
  }, []);

  return (
    <div className="rich-text-editor w-[800px] border-none bg-transparent mx-auto text-white text-body overflow-visible resize-none focus:outline-none">
      <ReactQuill ref={quillRef} placeholder="Start writing..." theme="bubble" value={initialContent} onChange={handleChange} className="ql-editor"  bounds=".rich-text-editor" modules={modules}/>
    </div>
  );
};

export default RichTextEditor;
