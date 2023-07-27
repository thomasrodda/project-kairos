import '../index.css';
import Divider from './Divider';
import PageList from './PageList';

const SideBar = ({ createPage, pages }) => {
    console.log(createPage);
    return (
        // SideBar //
        <div id="sideBar" className="fixed h-screen w-60 m-0 flex flex-col bg-darkest-grey">

            {/** Workspace */}
            <div id="workspace" className="p-3 flex items-center hover:bg-darker-grey">
                <img src="profile_icon.png" alt="Profile" className='IconSize'/>
                <h1 className="text-white text-h4 ml-2 mr-2">
                    Workspace Name
                </h1>
                <img src="switch_workspace_icon.png" alt="Switch Workspace" className="h-[15px]" />
            </div>

            {/** Top Menu */}
            <div id="TopMenu" className="p-2 space-y-1">
                {/** Search */}
                <div id="search" className="MenuItem MenuItem:hover">
                    <img src="search_icon.png" alt="Search" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Search
                    </h2>
                </div>
                {/** Settings */}
                <div id="settings" className="MenuItem MenuItem:hover">
                    <img src="settings_icon.png" alt="Settings" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Settings
                    </h2>
                </div>
                {/** Image Library */}
                <div id="imageLibrary" className="MenuItem MenuItem:hover">
                    <img src="image_icon.png" alt="Image Library" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Image Library
                    </h2>
                </div>
            </div>

            {/** Create Container */}
            <div id="createContainer" className="p-2">
                {/** New Page */}
                <div id="create" className="CreateButton gradient-border gradient-border:after" onClick={createPage}>
                    <img src="add_icon.png" alt="Create New" className='IconSize'/>
                    <h2 className="CreateButtonText">
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
                <PageList pages={pages} />
            </div>
            
            {/** Page Templates Container */}
             <div id="createContainer" className="py-1 px-2">
                {/** Page Templates */}
                <div id="templates" className="MenuItem MenuItem:hover">
                    <img src="folder_icon.png" alt="Templates" className='IconSize'/>
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
                    <img src="archive_icon.png" alt="Archive" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Archive
                    </h2>
                </div>
                {/** Members */}
                <div id="members" className="MenuItem MenuItem:hover">
                    <img src="members_icon.png" alt="Members" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Members
                    </h2>
                </div>
                {/** Help & Shortcuts */}
                <div id="help" className="MenuItem MenuItem:hover">
                    <img src="help_icon.png" alt="Help & Shortcuts" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Help & Shortcuts
                    </h2>
                </div>
                {/** Updates & News */}
                <div id="help" className="MenuItem MenuItem:hover">
                    <img src="updates_icon.png" alt="Updates & News" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Updates & News
                    </h2>
                </div>
            </div>
        </div>
    )
}

export default SideBar;