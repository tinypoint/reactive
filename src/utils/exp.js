import { baseParse, generate, transformExpression, getBaseTransformPreset, transform } from '@vue/compiler-core';

var decoder;
function decodeHtmlBrowser(raw, asAttr = false) {
  if (!decoder) {
    decoder = document.createElement('div');
  }
  if (asAttr) {
    decoder.innerHTML = `<div foo="${raw.replace(/"/g, '&quot;')}">`;
    return decoder.children[0].getAttribute('foo');
  } else {
    decoder.innerHTML = raw;
    return decoder.textContent;
  }
}

const runExp = (source) => {
  if (typeof source === 'undefined' && !source) {
    return {
      res: undefined,
      type: 'Undefined',
      status: 'success',
    };
  }
  if (typeof source === 'string' && !source) {
    return {
      res: '',
      type: 'String',
      status: 'success',
    };
  }
  const ast = baseParse(source, {
    decodeEntities: decodeHtmlBrowser,
  });

  const [baseTransform] = getBaseTransformPreset();
  const transformText = baseTransform[baseTransform.length - 1];
  try {
    transform(ast, {
      nodeTransforms: [transformExpression, transformText],
    });
  } catch (e) {
    return {
      res: undefined,
      type: 'Undefined',
      status: 'error',
      errMsg: e.message,
      errName: e.name,
      errStage: 'parse',
    };
  }

  const render = generate(ast, {
    mode: 'function',
    runtimeGlobalName: 'MyLowcode',
  });

  const expFn = new Function('MyLowcode', render.code);
  const MyLowcode = {
    toDisplayString: (val) => val,
  };
  const execExpFn = expFn(MyLowcode);
  const context = {
    msg: 'msg',
    test: {
      data: 'test.data',
    },
    say: () => {
      return 'say';
    },
  };
  let originRes;
  try {
    originRes = execExpFn(context);
  } catch (e) {
    return {
      res: undefined,
      type: 'Undefined',
      status: 'error',
      errMsg: e.message,
      errName: e.name,
      errStage: 'execute',
    };
  }

  let res = originRes;
  try {
    const execRes = new Function(`return ${res}`)();
    res = execRes;
  } catch (e) {
    // console.log(source, '类型解析失败，按字符串处理');
  }
  const expRes = {
    res,
    type: Object.prototype.toString.call(res).slice(8, -1),
    status: 'success',
  };

  return expRes;
};

export const parseExp = (source) => {
  const res = runExp(source);
  console.log(res);
  return res;
};
