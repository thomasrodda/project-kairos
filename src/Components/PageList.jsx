import React from 'react';
import '../index.css';
import pageIcon from '../Images/page_icon.png'

// PageList.jsx renders the list of pages in the sidebar.

const PageList = ({ pages, selectedPageId, setSelectedPageId }) => {
  return (
    <div>
      {pages.map(page =>
          <div 
              key={page.id} 
              className={`pageListItem ${page.id === selectedPageId ? 'selected' : ''}`} 
              onClick={() => setSelectedPageId(page.id)}
          >
              <img src={pageIcon} alt="Page" className='IconSize'/>
              <h2 className="pageItemText">
                  {page.name}
              </h2>
          </div>
      )}
    </div>
  );
}

export default PageList;
  
