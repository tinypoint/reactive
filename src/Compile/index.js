import React, { useEffect } from 'react';
import { parseExp } from '../utils/exp';

export default function Compile() {
  useEffect(() => {
    parseExp('{{ msg }}_{{ test.data }}_{{ say() }}');
  }, []);
  return (
    <div>
      <button
        onClick={() => {
          parseExp('{{ msg }}_{{ test.data }}_{{ say() }}');
        }}
      >
        字符串
      </button>
      <button
        onClick={() => {
          parseExp('123');
        }}
      >
        123
      </button>
      <button
        onClick={() => {
          parseExp('true');
        }}
      >
        true
      </button>
      <button
        onClick={() => {
          parseExp('[]');
        }}
      >
        {'[]'}
      </button>
      <button
        onClick={() => {
          parseExp('{ a: 1 }');
        }}
      >
        {'{ a: 1 }'}
      </button>
      <button
        onClick={() => {
          parseExp('{ a: test.data }');
        }}
      >
        {'{ a: test.data }'}
      </button>
      <button
        onClick={() => {
          parseExp('{ a: test1.data }');
        }}
      >
        {'{ a: test1.data }'}
      </button>
      <button
        onClick={() => {
          parseExp('null');
        }}
      >
        null
      </button>
      <button
        onClick={() => {
          parseExp('undefined');
        }}
      >
        undefined
      </button>
      <button
        onClick={() => {
          parseExp('test.data1');
        }}
      >
        test.data1
      </button>
      <button
        onClick={() => {
          parseExp('{{}}');
        }}
      >
        {'{{}}'}
      </button>
      <button
        onClick={() => {
          parseExp('');
        }}
      >
        {'""'}
      </button>
      <button
        onClick={() => {
          parseExp();
        }}
      >
        无字符串
      </button>
      <button
        onClick={() => {
          parseExp('{{abc}}');
        }}
      >
        {'{{abc}}'}
      </button>
      <button
        onClick={() => {
          parseExp('{{ab c}}');
        }}
      >
        {'{{ab c}}'}
      </button>
      <button
        onClick={() => {
          parseExp('{{ a ? 1 ? 2 }}');
        }}
      >
        {'{{ a ? 1 ? 2 }}'}
      </button>
    </div>
  );
}
