import ReactCodeMirror from '@uiw/react-codemirror';
import { useEffect, useMemo, useState } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion } from '@codemirror/autocomplete';
import { createSystem, createVirtualTypeScriptEnvironment } from '@typescript/vfs';
import ts from 'typescript';
import aaa from 'asset/source!typescript/lib/lib.es6.d.ts';
console.log(aaa);

const getLib = (name) => {
  //   const lib = dirname(require.resolve('typescript'));
  //   return readFileSync(join(lib, name), 'utf8');
};

const addLib = (name, map) => {
  //   map.set('/' + name, getLib(name));
};

const createDefaultMap2015 = () => {
  const fsMap = new Map();
  addLib('lib.es2015.d.ts', fsMap);
  addLib('lib.es2015.collection.d.ts', fsMap);
  addLib('lib.es2015.core.d.ts', fsMap);
  addLib('lib.es2015.generator.d.ts', fsMap);
  addLib('lib.es2015.iterable.d.ts', fsMap);
  addLib('lib.es2015.promise.d.ts', fsMap);
  addLib('lib.es2015.proxy.d.ts', fsMap);
  addLib('lib.es2015.reflect.d.ts', fsMap);
  addLib('lib.es2015.symbol.d.ts', fsMap);
  addLib('lib.es2015.symbol.wellknown.d.ts', fsMap);
  addLib('lib.es5.d.ts', fsMap);
  return fsMap;
};

const fsMap = createDefaultMap2015();

const system = createSystem(fsMap);

const compilerOpts = {
  target: ts.ScriptTarget.ES2015,
};
const tsserver = createVirtualTypeScriptEnvironment(system, ['index.ts'], ts, compilerOpts);

const placeholder = `var a = {
b: 1,
}
var c = 2;

a`;
fsMap.set('index.ts', placeholder);
function App() {
  const [value, setValue] = useState(placeholder);
  const extensions = useMemo(() => {
    return [
      javascript(),
      autocompletion({
        override: [
          (ctx) => {
            const { pos } = ctx;

            // tsserver is initialized using @typescript/vfs
            const completions = tsserver.languageService.getCompletionsAtPosition('index.ts', pos, {});
            if (!completions) {
              console.log('Unable to get completions', { pos });
              return null;
            }
            console.log(completions);
            return [];
            // return completeFromList(
            //   completions.entries.map((c) => ({
            //     type: c.kind,
            //     label: c.name,
            //   })),
            // )(ctx);
          },
        ],
      }),
    ];
  }, []);

  useEffect(() => {
    tsserver.updateFile('index.ts', value);
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
