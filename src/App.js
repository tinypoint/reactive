import ReactCodeMirror from '@uiw/react-codemirror';
import { useEffect, useMemo, useState } from 'react';
import { LRLanguage, syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { parser } from './grammar';
import { tags } from '@lezer/highlight';

function App() {
  const [value, setValue] = useState('{{abc}}');
  const extensions = useMemo(() => {
    const highlight = HighlightStyle.define([
      { tag: tags.number, color: '#fc6' },
      { tag: tags.string, color: '#f5d' },
      { tag: tags.content, color: 'red' },
    ]);
    return [
      LRLanguage.define({
        parser: parser,
      }),
      syntaxHighlighting(highlight),
    ];
  }, []);

  useEffect(() => {
    console.log(parser.parse(value).toString());
  }, [value]);

  return (
    <ReactCodeMirror
      extensions={extensions}
      value={value}
      onChange={setValue}
    />
  );
}

export default App;
