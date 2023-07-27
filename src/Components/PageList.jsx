import React from 'react';
import '../index.css';

const PageList = ({ pages }) => {
    return (
      <div>
        {pages.map(page =>
            <div key={page.id} className='pageListItem'>
                <img src="page_icon.png" alt="Page" className='IconSize'/>
                <h2 className="pageItemText">
                    {page.name}
                </h2>
            </div>)}
      </div>
    );
  }
  
export default PageList;
  
