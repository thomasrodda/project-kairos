import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';
import checkIcon from '../Images/check_icon.png'
import backIcon from '../Images/back_icon.png'

const CreateWorkspace = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');

  const handleTemplateSelection = (template) => {
    setSelectedTemplate(template);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (workspaceName.trim() === '') {
      alert('Workspace name cannot be empty');
      return;
    }
    alert(`Creating workspace: ${workspaceName} with template: ${selectedTemplate}`);
  };

  return (
    <div className="mainMenu menuBackground">
      <div className="menuContentArea">
        <div className="workspaceCreationHeading">
          <h1 className="text-pageName font-bold">Create Your Workspace</h1>
          {/* The text changes based on the stage */}
          <h2 className="text-h2 font-bold text-grey mx-2">{selectedTemplate ? 'Personalise...' : 'I am a...'}</h2>
        </div>

        {/* Template Selection */}
        {!selectedTemplate && (
          <div className="workspaceTemplateOptions">
              <div className="workspaceTemplateCard" onClick={() => handleTemplateSelection('Game Master')}>
                  <h2 className="workspaceTemplateHeader">Game Master!</h2>
                  <h2 className="workspaceTemplateSubheader">Includes templates for:</h2>
                  <div className="space-y-2 mb-5">
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Characters & NPCs
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Locations
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Organisations
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Monsters
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Quests
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Much, much more...
                          </span>
                      </div>
                  </div>
                  <div id="gameMasterButton" className="flex justify-center">
                      <button type="submit" className="w-full">
                          <div className="SpecialButton gradient-border gradient-border:after">
                              <h2 className="SpecialButtonText">
                                  Select Template
                              </h2>
                          </div>
                      </button>
                  </div>
              </div>
              <div className="workspaceTemplateCard" onClick={() => handleTemplateSelection('Novelist')}>
                  <h2 className="workspaceTemplateHeader">Novelist!</h2>
                  <h2 className="workspaceTemplateSubheader">Includes templates for:</h2>
                  <div className="space-y-2 mb-5">
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Characters & NPCs
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Locations
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Organisations
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Monsters
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Quests
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Much, much more...
                          </span>
                      </div>
                  </div>
                  <div id="gameMasterButton" className="flex justify-center">
                      <button type="submit" className="w-full">
                          <div className="SpecialButton gradient-border gradient-border:after">
                              <h2 className="SpecialButtonText">
                                  Select Template
                              </h2>
                          </div>
                      </button>
                  </div>
              </div>
              <div className="workspaceTemplateCard" onClick={() => handleTemplateSelection('Blank Slate')}>
                  <h2 className="workspaceTemplateHeader">Blank Slate!</h2>
                  <h2 className="workspaceTemplateSubheader">Includes templates for:</h2>
                  <div className="space-y-2 mb-5">
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Characters & NPCs
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Locations
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Organisations
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Monsters
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Quests
                          </span>
                      </div>
                      <div className="workspaceTemplateListItem">
                          <img src={checkIcon} alt="Templates" className='IconSize'/>
                          <span className="text-info text-white ml-2">
                              Much, much more...
                          </span>
                      </div>
                  </div>
                  <div id="gameMasterButton" className="flex justify-center">
                      <button type="submit" className="w-full">
                          <div className="SpecialButton gradient-border gradient-border:after">
                              <h2 className="SpecialButtonText">
                                  Select Template
                              </h2>
                          </div>
                      </button>
                  </div>
              </div>
          </div>
        )}

        {/* Workspace Details Form */}
        {selectedTemplate && (
          <form onSubmit={handleSubmit} className="createWorkspaceForm space-y-4">
            <div className="flex space-x-4 items-start">
              <div className="flex flex-col">
                <label className="formLabel">Icon:</label>
                <div className="formFields bg-gray-200 cursor-not-allowed w-14 h-14">
                  {/* Future icon picker */}
                </div>
              </div>
              <div className="flex flex-col flex-grow">
                <label className="formLabel">
                  Workspace Name:<span className="text-orange">*</span>
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="formFields"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col mb-4">
              <label className="formLabel">Description:</label>
              <textarea
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
                className="formFields"
                rows="3"
              ></textarea>
            </div>
            <div className="flex justify-center">
              <button type="submit" className="w-64 z-10 mt-4">
                <div className="SpecialButton gradient-border gradient-border:after">
                  <h2 className="SpecialButtonText">Create Workspace</h2>
                </div>
              </button>
            </div>
          </form>
        )}

        {/* Bottom Links */}
        <div className="self-end">
          <Link to="/workspace-selection" className="text-body">
            <img src={backIcon} alt="Back" className='IconSize'/>
            <span className="text-info text-light-grey">
                Back
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CreateWorkspace;
