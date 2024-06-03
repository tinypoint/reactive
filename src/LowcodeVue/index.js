import { useState } from 'react';
import { set, cloneDeep } from 'lodash-es';
import { faker } from '@faker-js/faker';
import Render from './Render';

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
