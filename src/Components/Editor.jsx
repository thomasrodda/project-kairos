import '../index.css';
import Lexical from './Lexical';

const Editor = () => {
    return (
        <div id="editor" className="editor h-screen overflow-scroll overflow-x-hidden m-0 flex items-center flex-col p-20 bg-off-black">
            <div className='w-[800px] mb-2'>
                <h1 className="text-pageName font-bold text-left">Page Name</h1>
            </div>
            <div className="lexicalContainer">
                <Lexical />
            </div>
        </div>
    )
}

export default Editor;