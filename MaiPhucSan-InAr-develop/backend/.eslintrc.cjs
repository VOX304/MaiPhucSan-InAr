module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    mocha: true
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-console': 'off'
  }
};
