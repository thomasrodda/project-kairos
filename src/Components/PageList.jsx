// Import required modules and components
import React, { useContext } from 'react';
import { UserContext } from '../UserContext';
import '../index.css';
import pageIcon from '../Images/page_icon.png'

// PageList.jsx renders the list of pages in the sidebar.
const PageList = ({ pages, selectedPageId, setSelectedPageId }) => {
  // Access the current user from UserContext
  const user = useContext(UserContext);

  console.log("Current user in PageList:", user);  // Log current user for debugging
  console.log("Pages in PageList:", pages);
  console.log("Selected Page ID in PageList:", selectedPageId);

  // Render the list of pages or a message if no pages are available
  return (
    <div>
      {pages.length === 0 ? (
        <div>No pages available.</div>
      ) : (
        pages.map(page =>
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
