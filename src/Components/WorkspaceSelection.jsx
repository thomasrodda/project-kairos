import React from 'react';
import '../index.css';
import profileIcon from '../Images/profile_icon.png'
import helpIcon from '../Images/help_icon.png'
import updatesIcon from '../Images/updates_icon.png'
import addIcon from '../Images/add_icon.png'
import settingsIcon from '../Images/settings_icon.png'

const WorkspaceSelection = () => {
    return (
        <div className="mainMenu menuBackground">
            <div className="menuContentArea flex justify-between">
                {/* Choose Your Workspace */}
                <div className="flex flex-col">
                    <div className="workspaceHeading mb-5">
                        <h1 className="text-pageName font-bold">Choose Your Workspace</h1>
                        <h2 className="text-body text-grey">Select an existing workspace or create a new one...</h2>
                    </div>
                    {/* Workspaces */}
                    <div className="workspaceItemList">
                        <button className="workspaceItem">
                            <img src={profileIcon} alt="Profile" className='IconSize'/>
                            <h2 className="workspaceItemText">
                                Workspace 1
                            </h2>
                        </button>
                        <button className="workspaceItem">
                            <img src={profileIcon} alt="Profile" className='IconSize'/>
                            <h2 className="workspaceItemText">
                                Workspace 2
                            </h2>
                        </button>
                        <button className="newWorkspaceItem">
                            <img src={addIcon} alt="Profile" className='IconSize'/>
                            <h2 className="text-grey text-h4 mx-2">
                                Create New Workspace
                            </h2>
                        </button>
                    </div>
                </div>
                {/* Account & Settings */}
                <div className=" flex flex-col p-2 space-y-1 items-end">
                    {/* Members */}
                    <button className="accountSettingsMenuItem">
                        <h2 className="MenuItemText">
                            Account
                        </h2>
                        <img src={profileIcon} alt="Account" className='IconSize'/>
                    </button>
                    {/* Settings */}
                    <button className="accountSettingsMenuItem">
                        <h2 className="MenuItemText">
                            App Settings
                        </h2>
                        <img src={settingsIcon} alt="App Settings" className='IconSize'/>
                    </button>
                    {/* Help & Shortcuts */}
                    <button className="accountSettingsMenuItem">
                        <h2 className="MenuItemText">
                            Help & Shortcuts
                        </h2>
                        <img src={helpIcon} alt="Help & Shortcuts" className='IconSize'/>
                    </button>
                    {/* Updates & News */}
                    <button className="accountSettingsMenuItem">
                        <h2 className="MenuItemText">
                            Updates & News
                        </h2>
                        <img src={updatesIcon} alt="Updates & News" className='IconSize'/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceSelection;
