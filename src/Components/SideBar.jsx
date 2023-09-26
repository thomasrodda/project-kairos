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

const SideBar = ({ createPage, pages, selectedPageId, setSelectedPageId }) => {
    console.log("Selected Page ID in SideBar:", selectedPageId);
    console.log(createPage);
    return (
        // SideBar //
        <div id="sideBar" className="fixed h-screen w-60 m-0 flex flex-col bg-darkest-grey">

            {/** Workspace */}
            <div id="workspace" className="p-3 flex items-center hover:bg-darker-grey">
                <img src={profileIcon} alt="Profile" className='IconSize'/>
                <h2 className="text-white text-h4 ml-2 mr-2">
                    Workspace Name
                </h2>
                <img src={switchWorkspaceIcon} alt="Switch Workspace" className="h-[15px]" />
            </div>

            {/** Top Menu */}
            <div id="TopMenu" className="p-2 space-y-1">
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
                    <img src={imageIcon} alt="Image Library" className='IconSize'/>
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