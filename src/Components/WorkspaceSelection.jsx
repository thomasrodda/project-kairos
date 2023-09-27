import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';
import profileIcon from '../Images/profile_icon.png'
import helpIcon from '../Images/help_icon.png'
import updatesIcon from '../Images/updates_icon.png'
import addIcon from '../Images/add_icon.png'
import settingsIcon from '../Images/settings_icon.png'

const WorkspaceSelection = () => {
    // State to hold the list of workspaces
    const [workspaces, setWorkspaces] = useState([]);

    // Fetch the list of workspaces (Dummy data for now)
    useEffect(() => {
        const dummyWorkspaces = [
            { id: '1', name: 'Workspace 1' },
            { id: '2', name: 'Workspace 2' },
            { id: '3', name: 'Workspace 3' },
        ];

        setWorkspaces(dummyWorkspaces);
    }, []);
    
    return (
        <div className="mainMenu menuBackground">
            <div className="menuContentArea boxShadowBlackL flex flex-row justify-between">
                {/* Choose Your Workspace */}
                <div className="flex flex-col">
                    <div className="workspaceHeading mb-10">
                        <h1 className="text-pageName font-bold">Choose Your Workspace</h1>
                        <h2 className="text-body text-grey">Select an existing workspace or create a new one...</h2>
                    </div>
                    {/* Workspaces */}
                    <div className="workspaceItemList">
                        {/* Dynamic rendering of workspaces */}
                        {workspaces.map((workspace) => (
                        <button
                            key={workspace.id}
                            className="workspaceItem"
                            onClick={() => alert(`Loading ${workspace.name}`)}
                        >
                            <img src={profileIcon} alt="Profile" className='IconSize'/>
                            <h2 className="workspaceItemText">
                            {workspace.name}
                            </h2>
                        </button>
                        ))}
                        {/* Create New Workspace button */}
                        <Link to="/create-workspace" className="newWorkspaceItem">  {/* The path should match the route you've set up for CreateWorkspace */}
                            <img src={addIcon} alt="Add" className='IconSize'/>
                            <h2 className="text-grey text-h4 mx-2">
                            Create New Workspace
                            </h2>
                        </Link>
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
