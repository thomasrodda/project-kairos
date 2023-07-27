import '../index.css';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {HeadingNode, $createHeadingNode} from '@lexical/rich-text';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$getRoot, $createTextNode} from 'lexical';

const theme = {
    text: {
        bold: 'editor-textBold',
        italic: 'editor-textItalic',
      },
    paragraph: 'editor-paragraph',
    quote: 'editor-quote',
    heading: {
        h1: 'editor-heading-h1',
        h2: 'editor-heading-h2',
        h3: 'editor-heading-h3',
        h4: 'editor-heading-h4',
        h5: 'editor-heading-h5',
        h6: 'editor-heading-h6',
    },
  }

function onError(error) {
    console.error(error);
}

const Lexical = () => {
    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        onError,
    };
    
    return (
        <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
            contentEditable={<ContentEditable className="contentEditable"/>}
            placeholder={<div className="placeholder">Start typing here...</div>}
            ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        </LexicalComposer>
    );
}

export default Lexical;

