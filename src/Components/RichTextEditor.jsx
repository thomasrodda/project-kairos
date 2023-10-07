// Import required modules and styles
import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import './quill.bubble.css'; // import styles
import { fetchGeneratedText } from '../AiService';
import ai_icon from '../Images/ai_icon.svg';
import ai_send_icon from '../Images/ai_send_icon.png';
import placeholder_icon from '../Images/placeholder_icon.png';
import Divider from './Divider';
import pageIcon from '../Images/page_icon.png';

// RichTextEditor.jsx integrates the Quill.js editor and manages its features.
const RichTextEditor = ({ initialContent, onContentChange, focusEditor }) => {

  // Declare states and refs
  //console.log("Initial content passed to RichTextEditor:", initialContent);
  const quillRef = useRef(null); // To store the ReactQuill element reference
  const [currentLine, setCurrentLine] = useState(null);
  const [currentOffset, setCurrentOffset] = useState(null);
  const [realTimeText, setRealTimeText] = useState("");

  // Sets isFormatting to false - to be used in deletion of typed '/'
  let isFormatting = false;

  // Handle content changes in the editor
  const handleChange = (editorContent) => {
    console.log("handleChange called");
    onContentChange(editorContent);
  };

  // Refocus editor after content save
  focusEditor = () => {
    const quill = quillRef.current.getEditor();
    quill.focus();
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
  
  // Show slash command dropdown
  const showDropdown = (line, offset) => {
      setCurrentLine(line);
      setCurrentOffset(offset);
      const dropdown = document.getElementById('slashDropdown');
      if (dropdown) {  // Null check
        dropdown.style.display = 'block';
        
        // Add this line to highlight the first item in the dropdown
        const firstItem = dropdown.querySelector('li');
        if (firstItem) {
          firstItem.classList.add('highlighted');
        }
    
        setTimeout(() => {
          const searchInput = document.getElementById('dropdownSearch');
          if (searchInput) {
            searchInput.focus();  // This will focus the input field
          }
        }, 100);
      }
    };

  // Reset highlighted dropdown option
  const resetHighlighted = () => {
    //console.log("resetHighlighted called");
    const dropdown = document.getElementById('slashDropdown');
    const highlighted = dropdown.querySelector('.highlighted');
    if (highlighted) {
      highlighted.classList.remove('highlighted');
    }
  };
  
  // Formats the text
  const formatText = (format, line, offset) => {
    const quill = quillRef.current.getEditor(); // Access the Quill instance
    // const selection = quill.getSelection(); // Get the current selection range - I think not needed.
    const index = quill.getIndex(line);   // Get the index and length of the line
    const length = line.length();

    //console.log("Quill instance:", quill);
    //console.log("Current selection:", selection);

    // Sets isFormatting to true - triggering the removal of typed '/'
    isFormatting = true;
    
    if (format === 'h1') {
      quill.formatLine(index, length, 'header', 1);
    } else if (format === 'h2') {
      quill.formatLine(index, length, 'header', 2);
    } else if (format === 'h3') {
      quill.formatLine(index, length, 'header', 3);
    } else if (format === 'h4') {
      quill.formatLine(index, length, 'header', 4);
    } else if (format === 'body') {
      quill.formatLine(index, length, 'header', false);  // Removes header formatting
    } else if (format === 'ol') {
      quill.formatLine(index, length, 'list', 'ordered');
    } else if (format === 'ul') {
      quill.formatLine(index, length, 'list', 'bullet');
    }

    // Remove the typed '/'
    if (isFormatting) {
      // Your existing code to delete '/'
      quill.deleteText(index + offset - 1, 1);  
      
      //quill.focus(); // Focuses the editor again - Not needed
      
      // Adjust the cursor position by one character to the left
      quill.setSelection(index + offset - 1, 0);
    }
    
    // Hide the dropdown after formatting and reset search and results
    const dropdown = document.getElementById('slashDropdown');
    const searchInput = document.getElementById('dropdownSearch');
    const items = dropdown.querySelectorAll('li');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
    resetHighlighted(); // Reset the highlighted option
      
    // Step 1: Clear the search input
    if (searchInput) {
      searchInput.value = '';
    }
    // Step 2: Reset the display property for all items
    items.forEach(item => {
      item.style.display = 'block';
    });
    // Step 3: Highlight the first item in the list
    if (items[0]) {
      items[0].classList.add('highlighted');
    }
    isFormatting = false; // Reset the flag
  };

  // Search functionality for slash command
  const handleSearch = (searchTerm) => {
    const dropdown = document.getElementById('slashDropdown');
    const items = dropdown.querySelectorAll('li');
    
    // Step 1: Remove highlighted class from all items
    items.forEach(item => {
      item.classList.remove('highlighted');
    });
    
    // Filter list items based on the search term
    items.forEach(item => {
      const values = item.getAttribute('data-value').split(',');
      if (values.some(value => value.toLowerCase().startsWith(searchTerm.toLowerCase()))) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
    
    // Step 2: Loop to find the first visible item
    for (const item of items) {
      if (item.style.display !== 'none') {
        // Step 3: Add highlighted class to the first visible item
        item.classList.add('highlighted');
        break;
      }
    }
  };

  // useEffect for event handling and cleanup
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
          //console.log('AI Assistant clicked');
          // Add your future AI logic here
        });
      }
      
      // Detects typed '/' to show Dropdown
        // Add a keyboard binding for '/'
        quill.keyboard.addBinding({
          key: 191,  // ASCII code for '/'
        }, (range, context) => {
          const { index } = range;

          // Insert the '/' character back into the editor at the index where it was typed.
          quill.insertText(index, '/');

          const [line, offset] = quill.getLine(index + 1); // Increment index by 1 since we've inserted '/'

          // Capture the position of typed '/'
          const bounds = quill.getBounds(index);
          //console.log("Bounds:", bounds); // Console log for capturing location

          if (line) {
            // Position Dropdown
            const dropdown = document.getElementById('slashDropdown');
            if (dropdown) {
              dropdown.style.left = `${bounds.left}px`;
              dropdown.style.top = `${bounds.top + bounds.height}px`; // positioning it below '/'
              dropdown.style.display = 'block';
            }

            // Save the line and offset in a state or some variable
            // to use later in `formatText` function
            showDropdown(line, offset);
          }
        });

      // Detects selection to show Tooltip
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

    // Close dropdown on escape key and reset search and results
    const handleGlobalKeydown = (event) => {
      if (event.key === 'Escape') {
        const dropdown = document.getElementById('slashDropdown');
        const searchInput = document.getElementById('dropdownSearch');
        const items = dropdown.querySelectorAll('li');
        dropdown.style.display = 'none';
        resetHighlighted();  // Reset the highlighted option
        //quill.focus(); // Focus the editor again - Not needed
    
        // Step 1: Clear the search input
        if (searchInput) {
          searchInput.value = '';
        }
    
        // Step 2: Reset the display property for all items
        items.forEach(item => {
          item.style.display = 'block';
        });
    
        // Step 3: Highlight the first item in the list
        if (items[0]) {
          items[0].classList.add('highlighted');
        }
      }
    };
    
    // Close dropdown on clicking outside and reset search and results
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('slashDropdown');
      const searchInput = document.getElementById('dropdownSearch');
      const items = dropdown.querySelectorAll('li');
    
      if (!dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
        resetHighlighted();  // Reset the highlighted option
        //quill.focus(); // Focus the editor again - Not needed
        
        // Step 1: Clear the search input
        if (searchInput) {
          searchInput.value = '';
        }
        
        // Step 2: Reset the display property for all items
        items.forEach(item => {
          item.style.display = 'block';
        });
    
        // Step 3: Highlight the first item in the list
        if (items[0]) {
          items[0].classList.add('highlighted');
        }
      }
    }; 

    // Listen for global keydown event
    document.addEventListener('keydown', handleGlobalKeydown);
    // Listen for clicks outside the dropdown
    document.addEventListener('click', handleClickOutside);

    // Listen for Keydown
    const searchInput = document.getElementById('dropdownSearch');
    if (searchInput) {
    searchInput.addEventListener('keydown', handleSearchKeydown);
    }

    // Cleanup event listener when the component unmounts
    return () => {
      const aiButton = document.querySelector('.ql-aiAssistant');
      if (aiButton) {
        aiButton.removeEventListener('click', () => {
          //console.log('AI Assistant clicked');
        });
      }
      // Cleanup
      document.removeEventListener('keydown', handleGlobalKeydown);
      document.removeEventListener('click', handleClickOutside);
      if (searchInput) {
        searchInput.removeEventListener('keydown', handleSearchKeydown);
      }
    };
  }
}, []);

  // Add a keydown event for the search input to handle Enter and arrow keys
  const handleSearchKeydown = (event) => {
    if (['Enter', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();  // Prevent default behavior
    }
    //console.log("Key pressed:", event.key);
    const dropdown = document.getElementById('slashDropdown');
    const items = Array.from(dropdown.querySelectorAll('li'));
    const highlighted = dropdown.querySelector('.highlighted');
    let index = items.indexOf(highlighted);
  
    if (event.key === 'Enter') {
      if (highlighted) {
        // Manually trigger the click event on the highlighted item
        const clickEvent = new Event('click', { 'bubbles': true });
        highlighted.dispatchEvent(clickEvent);
      }
    } else if (event.key === 'ArrowDown') {
      if (index < items.length - 1) {
        if (highlighted) highlighted.classList.remove('highlighted');
        items[index + 1].classList.add('highlighted');
      }
    } else if (event.key === 'ArrowUp') {
      if (index > 0) {
        if (highlighted) highlighted.classList.remove('highlighted');
        items[index - 1].classList.add('highlighted');
      }
    }
  }; 

  // AI Feature

    // Detect 'space' press on new line
    useEffect(() => {
      if (quillRef.current) {
        const quill = quillRef.current.getEditor();

        // Add a keyboard binding for 'space'
        quill.keyboard.addBinding({
          key: 32,  // ASCII code for 'space'
        }, (range, context) => {
          const { index } = range;
          const [line, offset] = quill.getLine(index);

          if (line) {
            const lineText = quill.getText(index - offset, offset).trim();
            if (lineText === '') {
              // Only show the AI UI if the line is blank and it's a new line
              showAiUI(index);
            } else {
              // Insert a space character if the line is not empty
              quill.insertText(index, ' ');
            }
          }
        });
      }
    }, []);

    // useEffect for real-time text update
    useEffect(() => {
      document.getElementById('generatedTextArea').innerText = realTimeText;
    }, [realTimeText]);    
    
    // Function to show the AI UI
    const showAiUI = (index) => {
      const bounds = quillRef.current.getEditor().getBounds(index);
      const aiDropdown = document.getElementById('aiDropdown');
      if (aiDropdown) {
        aiDropdown.style.left = `${bounds.left}px`;
        aiDropdown.style.top = `${bounds.top + bounds.height}px`;

        // Add a 'show' class to trigger the fade-in effect
        aiDropdown.classList.add('show');

        // Automatically focus the input field
        const aiCustomPrompt = document.getElementById('aiCustomPrompt');
        if (aiCustomPrompt) {
          aiCustomPrompt.focus();
        }
      }
    };

    // Function to hide the AI UI
    const hideAiUI = () => {
      const aiDropdown = document.getElementById('aiDropdown');
      if (aiDropdown) {
        aiDropdown.classList.remove('show');
      }
    };
  
    //Fetch generated text from AiService.js
    const fetchAndDisplayText = async () => {
      const promptInput = document.getElementById('aiCustomPrompt');
      if (promptInput) {
        const prompt = promptInput.value;
        const generatedText = await fetchGeneratedText(prompt);  // Existing AiService function
        if (generatedText) {
          const words = generatedText.split(' ');
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              const nextFewWords = words.slice(i, i + 1).join(' ');  // The number of words you want to append at a time
              setRealTimeText(prevText => prevText + ' ' + nextFewWords);
              i += 1;  // Increment by the same number of words you append at a time
            } else {
              clearInterval(interval);
            }
          }, 80);  // Change this to adjust the speed
        }
      }
    };     
    
    // Ai button Icons
    const placeholderIcon = placeholder_icon;
    const aiIcon = ai_icon;
  
    const handleMouseOver = (e) => {
      const imgElement = e.currentTarget.querySelector('img');
      if (imgElement) {
        imgElement.src = aiIcon;
      }
    };
  
    const handleMouseOut = (e) => {
      const imgElement = e.currentTarget.querySelector('img');
      if (imgElement) {
        imgElement.src = placeholderIcon;
      }
    };
  
    const handleClick = (label) => {
      // Your individual function for each button can go here
      console.log(`You clicked ${label}`);
    };

  return (
    <div className="rich-text-editor w-[800px] border-none bg-transparent mx-auto text-white text-body overflow-visible resize-none focus:outline-none relative">
      <ReactQuill ref={quillRef} placeholder="Start writing..." theme="bubble" value={initialContent} onChange={handleChange} className="ql-editor"  bounds=".rich-text-editor" modules={modules}/>
      
      {/* Slash Command Dropdown */}
      <div className="slash-dropdown" id="slashDropdown">
        <input
          id="dropdownSearch"
          type="text"
          placeholder="Type to search..."
          onInput={(e) => handleSearch(e.target.value)}
          autoComplete="off"
          />
        {/* Divider */}
        <div className="px-2">
          <Divider />
        </div>
        
        {/* List of Formatting Options */}
        <ul>
          <li data-value="h1,H1,heading 1,Heading 1" onClick={() => formatText('h1', currentLine, currentOffset)}>
            <img src={pageIcon} alt="Page" className='IconSize'/>
            Heading 1
          </li>
          <li data-value="h2,H2,heading 2,Heading 2" onClick={() => formatText('h2', currentLine, currentOffset)}>Heading 2</li>
          <li data-value="h3,H3,heading 3,Heading 3" onClick={() => formatText('h3', currentLine, currentOffset)}>Heading 3</li>
          <li data-value="h4,H4,heading 4,Heading 4" onClick={() => formatText('h4', currentLine, currentOffset)}>Heading 4</li>
          <li data-value="body,Body,text,Text" onClick={() => formatText('body', currentLine, currentOffset)}>Body</li>
          <li data-value="Numbered List,ordered list,ol,list with numbers,enumerate" onClick={() => formatText('ol', currentLine, currentOffset)}>Numbered List</li>
          <li data-value="Bulleted List,unordered list,ul,list with bullets,points" onClick={() => formatText('ul', currentLine, currentOffset)}>Bulleted List</li>
        </ul>
      </div>

      {/* AI Service */}
      <div id="aiDropdown" className="aiDropdown"> {/* This is your aiDropdown div */}
        <div id="aiCustomPromptContainer">
          <img src={ai_icon} alt="AI" className='IconSize'/>
          <input type="text" id="aiCustomPrompt" placeholder="Type your custom prompt..." autoComplete="off" />
          <button onClick={fetchAndDisplayText}> 
            <img src={ai_send_icon} alt="AI Send" className='IconSize'/>
          </button>
        </div>
        <div id="aiPresetPromptsContainer">
          {['Continue Writing', 'Lore Checker', 'Summarise', 'Improve Writing', 'Spelling & Grammar', 'Change Perspective', 'Change Tone', 'Make Shorter', 'Make Longer'].map((label, index) => (
            <button className="aiButtonPrompt" key={index}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <img src={placeholderIcon} alt="Preset" className='IconSize' />
              <span className="aiButtonLabel">
                {label}
              </span>
            </button>
          ))}
        </div>
        
        <div id="generatedTextArea">
          {/*} Generated text will be displayed here */}
        </div>
        
        <button id="insertText">Insert Text</button>
        <button id="cancelOperation">Cancel</button>
      </div>
    </div>
  );
};

export default RichTextEditor;
