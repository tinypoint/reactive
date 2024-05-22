import { useEffect, useState, memo } from 'react';
import { set, cloneDeep, isEqual } from 'lodash-es';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { faker } from '@faker-js/faker';

/**
 * 1. 静态解析依赖
 * 2. reactive.context 什么时候ready   组件渲染时，注册自身props到context
 * 3. 表达式什么时候解析 外层组件didMount时，开始解析表达式
 */
const reactive = {
  ast: (expStr) => {
    let objectAccesses = [];
    walk.simple(acorn.parse(expStr), {
      MemberExpression(node) {
        let objectName = '';
        let currentNode = node.object;
        while (currentNode.type === 'MemberExpression') {
          objectName = currentNode.property.name + '.' + objectName;
          currentNode = currentNode.object;
        }
        objectName = currentNode.name + '.' + objectName;
        // objectName = objectName.slice(0, -1); // 去除最后一个点号

        const propertyName = node.property.name;

        objectAccesses.push(objectName + propertyName);
      },
    });

    return objectAccesses;
  },
  context: {},
  expDeps: {
    // 'button1.text': 'input1.value + select1.value',
    // 'button2.text': 'button1.text + "suffix"',
  },
  expInDeps: {
    // 'input1.value': ['button1.text'],
    // 'select1.value': ['button1.text'],
    // 'button1.text': ['button2.text'],
  },
  execExpBath: async (exps) => {
    const fn = new Function(
      '_context, set',
      `var _ctx = _context;
       with(_context){
            ${exps
              .map((exp) => {
                return `{
                set(_ctx, "${exp.path}", ${exp.expStr});
              }`;
              })
              .join('\n')}
       } `,
    );
    fn(reactive.context, set);
  },

  updateDeps: (json) => {
    let temp = {};
    // 更新 reactive.expDeps 和 reactive.expInDeps
    json.forEach((item) => {
      const props = item.props || {};
      Object.keys(props).forEach((key) => {
        const value = props[key];
        if (value.startsWith('{{') && value.endsWith('}}')) {
          const expStr = value.slice(2, -2);
          reactive.expDeps[`${item.name}.${key}`] = expStr;
          // ast 静态解析依赖
          const deps = reactive.ast(expStr);
          temp[`${item.name}.${key}`] = deps;
        }
      });
    });

    Object.keys(temp).forEach((path) => {
      const deps = temp[path];
      deps.forEach((dep) => {
        if (!reactive.expInDeps[dep]) {
          reactive.expInDeps[dep] = [];
        }
        if (reactive.expInDeps[dep].findIndex((path) => path === dep) === -1) {
          reactive.expInDeps[dep].push(path);
        }
      });
    });
  },
  deleteDeps: () => {
    reactive.expDeps = {};
    reactive.expInDeps = {};
  },
  initExp: async () => {
    const whoUpdated = [];
    const keys = Object.keys(reactive.expDeps);
    let exps = [];
    for (let i = 0; i < keys.length; i++) {
      exps.push({
        path: keys[i],
        expStr: reactive.expDeps[keys[i]],
      });

      whoUpdated.push(keys[i]);
    }
    await reactive.execExpBath(exps);
    reactive.notifyValueChange(whoUpdated);
  },
  updateValue: async (name, key, value) => {
    // 递归将依赖了name,key 的表达式全部重新计算一遍，然后批量通知
    const whoUpdated = [];
    reactive.context[name][key] = value;
    set(reactive.context, `${name}.${key}`, value);
    whoUpdated.push(`${name}.${key}`);
    let exps = [];
    const _recyc = (path) => {
      const deps = reactive.expInDeps[path];
      if (deps?.length) {
        for (let i = 0; i < deps.length; i++) {
          exps.push({
            path: deps[i],
            expStr: reactive.expDeps[deps[i]],
          });
          whoUpdated.push(deps[i]);
          _recyc(deps[i]);
        }
      }
    };
    _recyc(`${name}.${key}`);

    await reactive.execExpBath(exps);

    reactive.notifyValueChange(whoUpdated);
    // input1.value => button1.text
    // button1.text 根据 input1.value + select1.value 计算
    // button1.text => button2.text
    // 通知 input1 button1 button2 重新渲染
  },
  notifyValueChange: (whoUpdated) => {
    whoUpdated.forEach((whoUpdate) => {
      const [name, key] = whoUpdate.split('.');
      reactive.effectMap[name] && reactive.effectMap[name](key);
    });
  },
  effectMap: {},
};

const Comps = {
  input: (props) => {
    const { placeholder, value, name, setValue } = props;
    const onChange = (e) => {
      setValue(name, 'value', e.target.value);
    };
    return (
      <div>
        {placeholder}
        <input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    );
  },
  select: (props) => {
    const { placeholder, value, name, setValue } = props;
    const onChange = (e) => {
      setValue(name, 'value', e.target.value);
    };
    return (
      <div>
        {placeholder}
        <select
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        >
          <option>b</option>
          <option>c</option>
        </select>
      </div>
    );
  },
  button: (props) => {
    const { text, color, setValue } = props;
    return (
      <button
        style={{ color }}
        onClick={() => {
          setValue('input1', 'value', '0');
        }}
      >
        {text}
      </button>
    );
  },
};

const Hoc = memo(
  (props) => {
    const { comp: Comp, name, props: originProps, setValue } = props;
    const getProps = (originProps) => {
      const ctx = reactive.context[name] || {};

      return {
        ...originProps,
        ...ctx,
      };
    };

    const [propForRender, setPropForRender] = useState(getProps(originProps));

    useEffect(() => {
      reactive.context[name] = {};
      const propForRender = getProps(originProps);
      reactive.context[name] = propForRender;
      setPropForRender(propForRender);

      reactive.effectMap[name] = () => {
        // 注册更新函数，当依赖的值发生变化时，重新渲染
        setPropForRender(getProps(originProps));
      };

      return () => {
        delete reactive.context[name];
      };
    }, [originProps]);

    return (
      <div>
        <Comp
          {...propForRender}
          setValue={setValue}
          name={name}
        />
      </div>
    );
  },
  (p1, p2) => {
    return isEqual(p1.props, p2.props);
  },
);

const Render = (props) => {
  const { json } = props;

  useEffect(() => {
    if (json) {
      reactive.updateDeps(json);
      reactive.initExp();
    }

    return () => {
      reactive.deleteDeps();
    };
  }, [json]);

  return (
    <>
      {(json || []).map((item) => {
        const Comp = Comps[item.type];
        return (
          <Hoc
            comp={Comp}
            props={item.props}
            name={item.name}
            key={item.name}
            deps={item.deps}
            setValue={(name, key, value) => {
              reactive.updateValue(name, key, value);
            }}
          />
        );
      })}
    </>
  );
};

const App = () => {
  const [json, setJson] = useState([
    {
      type: 'input',
      name: 'input1',
      props: {
        placeholder: '请输入',
        value: 'a',
      },
    },
    {
      type: 'select',
      name: 'select1',
      props: {
        placeholder: '请选择',
        value: '',
      },
    },
    {
      type: 'button',
      name: 'button1',
      props: {
        color: 'red',
        text: '{{input1.value + select1.value}}',
      },
    },
    {
      type: 'button',
      name: 'button2',
      props: {
        color: 'blue',
        text: '{{button1.text + "suffix"}}',
      },
    },
  ]);
  return (
    <>
      <Render json={json} />
      <button
        onClick={() => {
          const newJson = cloneDeep(json);
          set(newJson, '1.props.placeholder', '选择一下' + faker.internet.userName());
          setJson(newJson);
        }}
      >
        变更
      </button>

      <button
        onClick={() => {
          const newJson = cloneDeep(json);
          set(newJson, '3.props.text', `{{button1.text + "suffix${faker.internet.userName()}"}}`);
          setJson(newJson);
        }}
      >
        变更表达式
      </button>
    </>
  );
};

export default App;

window.reactive = reactive;
