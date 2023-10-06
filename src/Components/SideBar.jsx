// Import required modules and components
import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import '../index.css';
import Divider from './Divider';
import PageList from './PageList';
import profileIcon from '../Images/profile_icon.png'
import switchWorkspaceIcon from '../Images/switch_workspace_icon.png'
import searchIcon from '../Images/search_icon.png'
import settingsIcon from '../Images/settings_icon.png'
import imageIcon from '../Images/image_icon.png'
import addIcon from '../Images/add_icon.png'
import folderIcon from '../Images/folder_icon.png'
import archiveIcon from '../Images/archive_icon.png'
import membersIcon from '../Images/members_icon.png'
import helpIcon from '../Images/help_icon.png'
import updatesIcon from '../Images/updates_icon.png'

// SideBar.jsx renders the sidebar, containing the PageList and other features.
const SideBar = ({ createPage, pages, selectedPageId, setSelectedPageId, workspaces, selectedWorkspaceId, setSelectedWorkspaceId }) => {

    // Initialize state and context variables
    const user = useContext(UserContext);
    const navigate = useNavigate();

    // Debugging logs
    console.log("Current user in SideBar:", user);
    console.log("Selected Page ID in SideBar:", selectedPageId);
    console.log(createPage);

    // Function to handle workspace selection from the dropdown
    const handleWorkspaceChange = (event) => {
        const newWorkspaceId = event.target.value;
        setSelectedWorkspaceId(newWorkspaceId);
    };

    // Custom Dropdown Code
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const workspaceRef = useRef(null);    

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    
    useEffect(() => {
        const closeDropdown = (e) => {
            if (workspaceRef.current && workspaceRef.current.contains(e.target)) {
                return;
            }
            setIsDropdownOpen(false);
        };
        
        if (isDropdownOpen) {
            window.addEventListener('click', closeDropdown);
        }
        
        return () => {
            window.removeEventListener('click', closeDropdown);
        };
    }, [isDropdownOpen]);
    
    // Sidebar main content
    return (
        // SideBar //
        <div id="sideBar" className="fixed h-screen w-60 m-0 flex flex-col bg-darkest-grey">

            {/** Workspace */}
            <div id="workspaceContainer">
                <div id="workspace" ref={workspaceRef} className="p-3 flex items-center hover:bg-darker-grey space-x-3" onClick={toggleDropdown}>
                    <img src={profileIcon} alt="Profile" className='IconSize'/>
                    <span>
                        {workspaces.find(ws => ws.id === selectedWorkspaceId)?.name || 'Select a Workspace'}
                    </span>
                    <img src={switchWorkspaceIcon} alt="Switch Workspace" className="h-[15px]" />
                </div>
                {isDropdownOpen && (
                    <div id="workspaceDropdown" className="customDropdownList">
                        <div className="px-4 pt-4 pb-2 text-info text-light-grey">
                            <h2>Choose a Workspace</h2>
                        </div>
                        {workspaces.map((workspace) => (
                            <div className="workspaceDropdownItem" key={workspace.id} onClick={() => setSelectedWorkspaceId(workspace.id)}>
                                {workspace.name}
                            </div>
                        ))}
                        {/** Divider */}
                        <div className="px-4">
                            <Divider />
                        </div>
                        {/** Account */}
                        <div id="workspaceDropdownMenu" onClick={() => navigate('/workspace-selection')} className="px-4 text-info text-light-grey hover:text-white">
                            <h2>Workspace Menu</h2>
                        </div>
                        {/** Log Out */}
                        <div id="workspaceDropdownCreate" onClick={() => navigate('/create-workspace')} className="px-4 py-1 text-info text-light-grey hover:text-white">
                            <h2>Create a New Workspace</h2>
                        </div>
                        {/** Divider */}
                        <div className="px-4">
                            <Divider />
                        </div>
                        {/** Account */}
                        <div id="account" className="px-4 text-info text-light-grey hover:text-white">
                            <h2>Account Settings</h2>
                        </div>
                        {/** Log Out */}
                        <div id="logOut" className="px-4 pt-1 pb-4 text-info text-light-grey hover:text-white">
                            <h2>Log Out</h2>
                        </div>
                    </div>
                )}
            </div>
            
            {/** Top Menu */}
            <div id="topMenu" className="p-2 space-y-1">
                {/** Search */}
                <div id="search" className="MenuItem MenuItem:hover">
                    <img src={searchIcon} alt="Search" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Search
                    </h2>
                </div>
                {/** Settings */}
                <div id="settings" className="MenuItem MenuItem:hover">
                    <img src={settingsIcon} alt="Settings" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Settings
                    </h2>
                </div>
                {/** Image Library */}
                <div id="imageLibrary" className="MenuItem MenuItem:hover">
                    <img src={imageIcon} alt="Images Library" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Image Library
                    </h2>
                </div>
            </div>

            {/** Create Container */}
            <div id="createContainer" className="p-2">
                {/** New Page */}
                <div id="create" className="SpecialButton2 gradient-border2 gradient-border2:after" onClick={createPage}>
                    <img src={addIcon} alt="Create New" className='IconSize'/>
                    <h2 className="SpecialButton2Text">
                    Create
                    </h2>
                </div>
            </div>

            {/** Divider */}
            <div className="px-4">
                <Divider />
            </div>

            {/** Page List */}
            <div id="pageList" className="pageList flex-grow overflow-scroll overflow-x-hidden">
                <PageList pages={pages} selectedPageId={selectedPageId} setSelectedPageId={setSelectedPageId} />
            </div>
            
            {/** Page Templates Container */}
             <div id="createContainer" className="py-1 px-2">
                {/** Page Templates */}
                <div id="templates" className="MenuItem MenuItem:hover">
                    <img src={folderIcon} alt="Templates" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Page Templates
                    </h2>
                </div>
            </div>

            {/** Divider */}
            <div className="px-4">
                <Divider />
            </div>

            {/** Bottom Menu */}
            <div id="BottomMenu" className="p-2 space-y-1">
                {/** Archive */}
                <div id="archive" className="MenuItem MenuItem:hover">
                    <img src={archiveIcon} alt="Archive" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Archive
                    </h2>
                </div>
                {/** Members */}
                <div id="members" className="MenuItem MenuItem:hover">
                    <img src={membersIcon} alt="Members" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Members
                    </h2>
                </div>
                {/** Help & Shortcuts */}
                <div id="help" className="MenuItem MenuItem:hover">
                    <img src={helpIcon} alt="Help & Shortcuts" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Help & Shortcuts
                    </h2>
                </div>
                {/** Updates & News */}
                <div id="updates" className="MenuItem MenuItem:hover">
                    <img src={updatesIcon} alt="Updates & News" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Updates & News
                    </h2>
                </div>
            </div>
        </div>
    )
}

export default SideBar;