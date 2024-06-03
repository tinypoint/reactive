import { ReactiveEffect, ref } from '@vue/reactivity';
import { useEffect } from 'react';

const a = ref(0);
const b = ref(0);

function Item(props) {
  const { name } = props;
  useEffect(() => {
    const getter = () => {
      console.log('getter ' + name);
      return a.value + ' + ' + b.value;
    };
    const NOOP = () => {};
    const scheduler = () => {
      if (!effect.active) {
        return;
      }
      effect.run();
      console.log('watch ' + name);
    };
    const effect = new ReactiveEffect(getter, NOOP, scheduler);
    effect.run();
    return () => {
      effect.stop();
    };
  }, []);

  return (
    <>
      <button
        onClick={() => {
          a.value++;
        }}
      >
        更改a
      </button>
      <button
        onClick={() => {
          b.value++;
        }}
      >
        更改b
      </button>
    </>
  );
}

export default function Reactive() {
  return (
    <>
      <Item name="第一个" />
      <Item name="第二个" />
    </>
  );
}
