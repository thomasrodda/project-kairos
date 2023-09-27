import React, { useState, useRef, useEffect } from 'react';
import closeIcon from '../Images/close_icon.png'
import placeholderIcon from '../Images/placeholder_icon.png'
import '../index.css';

// CreatePage.jsx is responsible for rendering a popup to create a new page.

const CreatePage = ({ createPage, closePopup }) => {
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);  

  const handleSubmit = (event) => {
    event.preventDefault();
    if (name.trim() !== '') { // only proceed if name is not an empty string
      createPage(name);
      closePopup();
    }
  };

  return (
    <div className="createPagePopup">
        <div className='flex justify-between items-start'>
            <h2 className="text-pageName font-bold mb-6">Create Page</h2>
            <button type="button" onClick={closePopup}>
                <img src={closeIcon} alt="Close" className='IconSize opacity-50 hover:opacity-100'></img>
            </button>
        </div>
        <form onSubmit={handleSubmit} className='flex flex-col space-y-10'>
            <div id="formFields" className="flex space-x-4">
                <div id="pageIconSelector" className='flex flex-col space-y-2'>
                    <label className='formLabels'>Icon</label>
                    <div className='formFields'>
                        <img src={placeholderIcon} alt="Page Icon" className='IconSize'></img>
                    </div>
                </div>
                <div id="pageNameField" className="flex flex-col space-y-2 flex-grow">
                    <label className='formLabels'>Page Name</label>
                    <input type="text" className='formFields' value={name} onChange={(e) => setName(e.target.value)} ref={inputRef} />
                </div>
            </div>
            <div id="formButtonContainer" className="flex justify-center">
                <button type="submit" className="w-64">
                    <div id="createButton" className="SpecialButton SpecialButton:hover gradient-border gradient-border:after">
                      <h2 className="SpecialButtonText">
                          Create Page
                      </h2>
                    </div>
                </button>
            </div>
        </form>
    </div>
  );
};

export default CreatePage;
