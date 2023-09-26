import React from 'react';
import '../index.css';
import checkIcon from '../Images/check_icon.png'

const CreateWorkspace = () => {
  const createDefaultWorkspace = () => {
    // Create default workspace (to be implemented)
  };

  return (
    <div className="mainMenu menuBackground">
      <div className="menuContentArea">
        <div className="workspaceCreationHeading">
          <h1 className="text-pageName font-bold">Create Your Workspace</h1>
          <h2 className="text-h2 font-bold text-grey">I am a...</h2>
        </div>
        <div className="workspaceTemplateOptions">
            <div className="workspaceTemplateCard">
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
            <div className="workspaceTemplateCard">
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
            <div className="workspaceTemplateCard">
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
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspace;
