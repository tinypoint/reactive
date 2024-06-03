import ReactCodeMirror from '@uiw/react-codemirror';
import { useEffect, useMemo, useState, useRef } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import { createSystem, createVirtualTypeScriptEnvironment } from '@typescript/vfs';
import { createDefaultMapFromCDN } from '@typescript/vfs';
import ts from 'typescript';

const placeholder = `var a = {
b: 1,
}
var c = 2;

params`;

function toSet(chars) {
  let flat = Object.keys(chars).join('');
  let words = /\w/.test(flat);
  if (words) flat = flat.replace(/\w/g, '');
  return `[${words ? '\\w' : ''}${flat.replace(/[^\w\s]/g, '\\$&')}]`;
}

function prefixMatch(options) {
  let first = Object.create(null),
    rest = Object.create(null);
  for (let { label } of options) {
    first[label[0]] = true;
    for (let i = 1; i < label.length; i++) rest[label[i]] = true;
  }
  let source = toSet(first) + toSet(rest) + '*$';
  return [new RegExp('^' + source), new RegExp(source)];
}

function App() {
  const [value, setValue] = useState(placeholder);
  const tsserverRef = useRef();
  useEffect(() => {
    const start = async () => {
      const shouldCache = true;
      // This caches the lib files in the site's localStorage
      const fsMap = await createDefaultMapFromCDN({ target: ts.ScriptTarget.ES2015 }, '3.7.3', shouldCache, ts);

      fsMap.set('index.ts', "const hello = 'hi'");
      return fsMap;
    };

    start().then((fsMap) => {
      console.log('start');
      const system = createSystem(fsMap);

      const compilerOpts = {
        target: ts.ScriptTarget.ES2015,
      };
      tsserverRef.current = createVirtualTypeScriptEnvironment(system, ['index.ts'], ts, compilerOpts);
    });
  }, []);
  const extensions = useMemo(() => {
    return [
      javascript(),
      autocompletion({
        override: [
          (ctx) => {
            const { pos } = ctx;
            // console.log(ctx);
            // console.log(ctx.state.doc.toString()[pos - 1]);
            const completions = tsserverRef.current?.languageService.getCompletionsAtPosition('index.ts', pos + 98, {});
            if (!completions) {
              console.log('Unable to get completions', { pos });
              return null;
            }
            console.log(completions.entries);
            const options = completions.entries.map((c) => ({
              type: c.kind,
              label: c.name,
            }));
            let [validFor, match] = options.every((o) => /^\w+$/.test(o.label))
              ? [/(\w|\.)*$/, /(\w|\.)+$/]
              : prefixMatch(options);

            let token = ctx.matchBefore(match);
            console.log(token, match);
            return token ? { from: token ? token.from : ctx.pos, options, validFor } : null;
          },
        ],
      }),
    ];
  }, []);

  useEffect(() => {
    tsserverRef.current?.updateFile(
      'index.ts',
      `interface IParams {
  format: (val: string) => void;
};
function _______test(params: IParams) {
  ${value || ''}
}`,
    );
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
