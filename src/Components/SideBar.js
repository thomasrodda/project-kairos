import '../index.css';
import Divider from './Divider';

const SideBar = () => {
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
            <div id="TopMenu" className="py-2 px-1 space-y-1">
                {/** Search */}
                <div id="search" className="MenuItem MenuItem:hover">
                    <img src="search_icon.png" alt="Profile" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Search
                    </h2>
                </div>
                {/** Settings */}
                <div id="search" className="MenuItem MenuItem:hover">
                    <img src="settings_icon.png" alt="Profile" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Settings & Members
                    </h2>
                </div>
                {/** Image Library */}
                <div id="search" className="MenuItem MenuItem:hover">
                    <img src="image_icon.png" alt="Profile" className='IconSize'/>
                    <h2 className="MenuItemText">
                        Image Library
                    </h2>
                </div>
                {/** New Page */}
                <div id="search" className="MenuItem MenuItem:hover">
                    <img src="add_icon.png" alt="Profile" className='IconSize'/>
                    <h2 className="MenuItemText">
                        New Page
                    </h2>
                </div>
            </div>

            {/** Divider */}
            <div className="px-4">
                <Divider />
            </div>

            {/** Page List */}
            <div id="pagelist">

            </div>
        </div>
    )
}

export default SideBar;