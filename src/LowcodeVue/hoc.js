import { useEffect, useState, memo, useMemo, useContext } from 'react';
import { isEqual } from 'lodash-es';
import { ReactiveEffect, isRef, ReactiveFlags, computed } from '@vue/reactivity';
import { isArray, isMap, isObject, isPlainObject, isSet } from '@vue/shared';
import ReactiveContext from './context';

export function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject(value) || value[ReactiveFlags.SKIP]) {
    return value;
  }

  seen = seen || new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  depth--;
  if (isRef(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, depth, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, key)) {
        traverse(value[key], depth, seen);
      }
    }
  }
  return value;
}

export const Hoc = memo(
  (props) => {
    const { comp: Comp, name, props: originProps } = props;
    const context = useContext(ReactiveContext);
    const [rerenderKey, setRerenderKey] = useState(0);

    const reactiveProps = useMemo(() => {
      return context.computed[name];
    }, [context.computed[name]]);

    const computedProps = useMemo(() => {
      return computed(() => {
        return {
          ...reactiveProps.value,
        };
      });
    }, [rerenderKey]);

    useEffect(() => {
      // 把静态属性包裹在ref里
      // 把整个属性包裹在compute里？

      const getter = () => {
        return traverse(computedProps.value);
      };
      const NOOP = () => {};
      const scheduler = () => {
        if (!effect.active) {
          return;
        }

        effect.run();

        setRerenderKey((key) => key + 1);
      };
      const effect = new ReactiveEffect(getter, NOOP, scheduler);
      effect.run();
      return () => {
        effect.stop();
      };
    }, [originProps]);

    return (
      <div>
        <Comp
          {...computedProps.value}
          setValue={(name, key, value) => {
            context.reacitve[name][key] = value;
          }}
          name={name}
        />
      </div>
    );
  },
  (p1, p2) => {
    return isEqual(p1.props, p2.props);
  },
);
