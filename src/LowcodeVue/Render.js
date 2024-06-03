import { useMemo } from 'react';
import { Comps } from './comps';
import { reactive, computed } from '@vue/reactivity';
import { Hoc } from './hoc';
import ReactiveContext from './context';

const Render = (props) => {
  const { json } = props;

  const context = useMemo(() => {
    const context = {
      reacitve: {},
      computed: {},
    };
    json.forEach((item) => {
      const props = {};
      Object.keys(item.props || {}).forEach((key) => {
        const value = item.props[key];
        if (!(value.startsWith('{{') && value.endsWith('}}'))) {
        }
      });
      context.reacitve[item.name] = reactive(item.props || {});
    });
    json.forEach((item) => {
      context.computed[item.name] = computed(() => {
        const expressions = {};
        Object.keys(item.props || {}).forEach((key) => {
          const value = item.props[key];
          if (value.startsWith('{{') && value.endsWith('}}')) {
            const expStr = value.slice(2, -2);
            const fn = new Function(
              '_context',
              `var _ctx = _context;
              with(_context){
                   return ${expStr};
              } `,
            );
            expressions[key] = fn(context.reacitve);
          }
        });
        return {
          ...context.reacitve[item.name],
          ...expressions,
        };
      });
    });

    return context;
  }, [json]);

  return (
    <ReactiveContext.Provider value={context}>
      {(json || []).map((item) => {
        const Comp = Comps[item.type];
        return (
          <Hoc
            comp={Comp}
            props={item.props}
            name={item.name}
            key={item.name}
          />
        );
      })}
    </ReactiveContext.Provider>
  );
};

export default Render;
