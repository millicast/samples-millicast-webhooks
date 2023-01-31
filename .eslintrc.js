module.exports = {
  'extends': [ 'eslint:recommended', 'google' ],

  'parserOptions': {
    'ecmaVersion': 11, // 2020
  },

  'env': {
    'node': true,
    'es6':  true
  },

  'rules': {
    // not too concerned about long lines
    'max-len': [ 'warn', 180 ],

    // override this rule, its insanely more common to allow the spaces
    'object-curly-spacing': [
      'error', 'always', {
        'arraysInObjects':  false,
        'objectsInObjects': false
      }
    ],

    // same as above
    'array-bracket-spacing': [
      'error', 'always', {
        'objectsInArrays': false,
        'arraysInArrays':  false
      }
    ],

    // always check, but allow all that begin with underscore
    'no-unused-vars': [
      'warn', {
        'vars':         'all',
        'args':         'all',
        'caughtErrors': 'all',

        'argsIgnorePattern':         '^_',
        'varsIgnorePattern':         '^_',
        'caughtErrorsIgnorePattern': '^_'
      }
    ],

    // relax this Google rule
    'comma-dangle': [
      'error', 'only-multiline'
    ],

    // relax google rule (remove rule once all things are documented)
    'require-jsdoc': [
      'error', {
        'require': {
          'FunctionDeclaration': false
        }
      }
    ],

    // expand google rule to allow EOL comments
    'no-multi-spaces': [
      'error', {
        'ignoreEOLComments': true
      }
    ],

    // expand google rule to allow ternary before
    'operator-linebreak': [
      'error', 'after', {
        'overrides': { '?': 'before', ':': 'before' }
      }
    ],

    // relax google rule (allow 1 or more spaces for aligning purposes)
    'key-spacing': [
      'error', {
        'mode': 'minimum'
      }
    ],

    // rule isn't flexible enough, prefer aligned indents
    'indent': [ 'off' ],

    // override this rule to exclude specific classes
    'new-cap': [
      'warn', {
        'capIsNewExceptions': []
      }
    ]
  }
};
