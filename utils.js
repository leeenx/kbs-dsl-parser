// sort-hand
const resolveFunKeysMap = {
  'const': 'co',
  'getValue': 'gV',
  'let': 'l',
  'var': 'v',
  'batchConst': 'bC',
  'batchLet': 'bL',
  'batchVar': 'bV',
  'batchDeclaration': 'bD',
  'getConst': 'gC',
  'getLet': 'gL',
  'getVar': 'gVar',
  'getFunction': 'gF',
  'getArg': 'gA',
  'getObjMember': 'gOM',
  'getOrAssignOrDissocPath': 'gADP',
  'assignLet': 'aL',
  'getResultByOperator': 'gRBO',
  'setLet': 'sL',
  'callReturn': 'cR',
  'callBreak': 'cBr',
  'callContinute': 'cCo',
  'callUnary': 'cU',
  'callBinary': 'cB',
  'callUpdate': 'cUp',
  'callLogical': 'cL',
  'callThrow': 'cT',
  'callWhile': 'cW',
  'callDoWhile': 'cDW',
  'callFor': 'cF',
  'callForIn': 'cFI',
  'destroy': 'd',
  'delete': 'del',
  'createFunction': 'f',
  'callBlockStatement': 'cBS',
  'callIfElse': 'cIE',
  'callConditional': 'cC',
  'getRegExp': 'gRE',
  'newClass': 'nC',
  'callFun': 'c',
  'callTryCatch': 'cTC',
  'callSwitch': 's',
  'callSequence': 'cS'
};

const resolveTypeKeysMap = {
  'call-function': 'c',
  'customize-function': 'f',
  component: 'f',
  'array-literal': 'a',
  'object-literal': 'o',
  literal: 'l'
};

const dslObjKeyNamesMap = {
  type: 't',
  name: 'n',
  value: 'v',
  params: 'p',
  body: 'b',
  key: 'k'
};

module.exports = {
  getCallFunName: (name, compress = false) => {
    if (!compress || !resolveFunKeysMap[name]) return name;
    return resolveFunKeysMap[name];
  },
  getTypeName: (name, compress = false) => {
    if (!compress || !resolveTypeKeysMap[name]) return name;
    return !resolveTypeKeysMap[name];
  },
  getKeyName: (name, compress = false) => {
    if (!compress || !dslObjKeyNamesMap[name]) return name;
    return !dslObjKeyNamesMap[name];
  }
};
