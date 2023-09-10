import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import './quill.bubble.css'; // import styles
import ai_icon from '../Images/ai_icon.svg'

// RichTextEditor.jsx integrates the Quill.js editor and manages its features.

const RichTextEditor = ({ initialContent, onContentChange }) => {
  const quillRef = useRef(null); // To store the ReactQuill element reference

  const [currentLine, setCurrentLine] = useState(null);
  const [currentOffset, setCurrentOffset] = useState(null);

  const handleChange = (editorContent) => {
    onContentChange(editorContent);
  };

  // Configuration object for the Quill.js toolbar.
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'], // Toggled buttons
      [{ 'header': ['1', '2', '3', '4', false] }], // Dropdown for headers and body text  
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'align': [] }],
      //[{ 'script': 'sub'}, { 'script': 'super' }], // Superscript/subscript
      ['blockquote', 'code-block'],
      ['clean'] // Remove formatting button
    ],
  };
  
  // Code to Display Slash Dropdown
    const showDropdown = (line, offset) => {
      setCurrentLine(line);
      setCurrentOffset(offset);
      const dropdown = document.getElementById('slashDropdown');
      if (dropdown) {  // Null check
        dropdown.style.display = 'block';
        setTimeout(() => {
          const searchInput = document.getElementById('dropdownSearch');
          if (searchInput) {
            searchInput.focus();  // This will focus the input field
          }
        }, 100);
      }
    };  

    const formatText = (format, line, offset) => {
      const quill = quillRef.current.getEditor(); // Access the Quill instance
      const selection = quill.getSelection(); // Get the current selection range
      const index = quill.getIndex(line);   // Get the index and length of the line
      const length = line.length();

      console.log("Quill instance:", quill);
      console.log("Current selection:", selection);
      
      if (format === 'h1') {
        quill.formatLine(index, length, 'header', 1);
      } else if (format === 'h2') {
        quill.formatLine(index, length, 'header', 2);
      } else if (format === 'body') {
        quill.formatLine(index, length, 'header', false);  // Removes header formatting
      }
      
      // Hide the dropdown after formatting
        const dropdown = document.getElementById('slashDropdown');
        const searchInput = document.getElementById('dropdownSearch');
        if (dropdown) {
          dropdown.style.display = 'none';
        }
        if (searchInput) {
          searchInput.value = '';  // Clear the search input
        }
    };

  // Code for Slash Search
    const handleSearch = (searchTerm) => {
      const dropdown = document.getElementById('slashDropdown');
      const items = dropdown.querySelectorAll('li');
      // Filter list items based on the search term
      items.forEach(item => {
        const values = item.getAttribute('data-value').split(',');
        if (values.some(value => value.toLowerCase().startsWith(searchTerm.toLowerCase()))) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
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
        aiButton.innerHTML = `<img src="${ai_icon}" alt="AI Assistant" /><span>Ask AI</span>`;
        
        // Insert custom button at the beginning of the toolbar
        toolbar.container.insertBefore(aiButton, toolbar.container.firstChild);

        // Add event listener to custom button
        aiButton.addEventListener('click', () => {
          console.log('AI Assistant clicked');
          // Add your future AI logic here
        });
      }

      quill.on('text-change', function(delta, oldDelta, source) {
        const text = quill.getText();
        const slashIndex = text.lastIndexOf('/');
        if (slashIndex !== -1) {
          const [line, offset] = quill.getLine(slashIndex);
          if (line) {
            // Save the line and offset in a state or some variable
            // to use later in `formatText` function
            showDropdown(line, offset);
          }
        }
      });      

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

    // Close dropdown on escape key
      const handleGlobalKeydown = (event) => {
        if (event.key === 'Escape') {
          const dropdown = document.getElementById('slashDropdown');
          dropdown.style.display = 'none';
        }
      };
    
    // Close dropdown on clicking outside
      const handleClickOutside = (event) => {
        const dropdown = document.getElementById('slashDropdown');
        if (!dropdown.contains(event.target)) {
          dropdown.style.display = 'none';
        }
      };

    // Listen for global keydown event
      document.addEventListener('keydown', handleGlobalKeydown);
    // Listen for clicks outside the dropdown
      document.addEventListener('click', handleClickOutside);

      // Cleanup event listener when the component unmounts
      return () => {
        const aiButton = document.querySelector('.ql-aiAssistant');
        if (aiButton) {
          aiButton.removeEventListener('click', () => {
            console.log('AI Assistant clicked');
          });
        }
        // Cleanup
        document.removeEventListener('keydown', handleGlobalKeydown);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, []);

  // Add a keydown event for the search input to handle Enter and arrow keys
    const handleSearchKeydown = (event) => {
      const dropdown = document.getElementById('slashDropdown');
      const items = Array.from(dropdown.querySelectorAll('li'));
      const highlighted = dropdown.querySelector('.highlighted');
      let index = items.indexOf(highlighted);
  
      if (event.key === 'Enter') {
        if (highlighted) {
          highlighted.click();  // Trigger the click event to apply formatting
        }
      } else if (event.key === 'ArrowDown') {
        if (index < items.length - 1) {
          items[index + 1].classList.add('highlighted');
          if (highlighted) highlighted.classList.remove('highlighted');
        }
      } else if (event.key === 'ArrowUp') {
        if (index > 0) {
          items[index - 1].classList.add('highlighted');
          if (highlighted) highlighted.classList.remove('highlighted');
        }
      }
    };

  return (
    <div className="rich-text-editor w-[800px] border-none bg-transparent mx-auto text-white text-body overflow-visible resize-none focus:outline-none">
      <ReactQuill ref={quillRef} placeholder="Start writing..." theme="bubble" value={initialContent} onChange={handleChange} className="ql-editor"  bounds=".rich-text-editor" modules={modules}/>
      <div className="slash-dropdown" id="slashDropdown">
        <input
          id="dropdownSearch"
          type="text"
          placeholder="Type to search..."
          onInput={(e) => handleSearch(e.target.value)}
          />
        <ul>
          <li data-value="h1,H1,heading 1,Heading 1" onClick={() => formatText('h1', currentLine, currentOffset)}>Heading 1</li>
          <li data-value="h2,H2,heading 2,Heading 2" onClick={() => formatText('h2', currentLine, currentOffset)}>Heading 2</li>
          <li data-value="body,Body,text,Text" onClick={() => formatText('body', currentLine, currentOffset)}>Body</li>
        </ul>
      </div>
    </div>
  );
};

export default RichTextEditor;
