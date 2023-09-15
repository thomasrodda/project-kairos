import React from 'react';
import '../index.css';
import pageIcon from '../Images/page_icon.png'

// PageList.jsx renders the list of pages in the sidebar.

const PageList = ({ pages, selectedPageId, setSelectedPageId }) => {
  console.log("Pages in PageList:", pages);
  console.log("Selected Page ID in PageList:", selectedPageId);
  return (
    <div>
      {pages.length === 0 ? (  // <-- This line is fine
        <div>No pages available.</div>  // <-- This line is fine
      ) : (
        pages.map(page =>  // <-- Remove the curly braces here
          <div 
              key={page.id} 
              className={`pageListItem ${page.id === selectedPageId ? 'selected' : ''}`} 
              onClick={() => {
                setSelectedPageId(page.id);
                console.log("Just set SelectedPageId to:", page.id);
              }}
          >
              <img src={pageIcon} alt="Page" className='IconSize'/>
              <h2 className="pageItemText">
                  {page.name}
              </h2>
          </div>
        )
      )}
    </div>
  );
}

export default PageList;
