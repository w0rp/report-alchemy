const path = require('path')

module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  // Start with standardjs as a base.
  extends: 'standard',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    warnOnUnsupportedTypeScriptVersion: false,
    project: path.join(__dirname, '/tsconfig.json'),
  },
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  rules: {
    /** Specific AST rules for this project. */
    'no-restricted-syntax': [
      'error',
      // Array.of isn't meant to be called directly, but used as an expression.
      {
        selector: "CallExpression[callee.object.name='Array'][callee.property.name='of']",
        message: 'You probably meant to use Array.from',
      },
    ],
    /**
     * Rules that go against StandardJS are here.
     *
     * StandardJS only gets a few things wrong.
     **/

    // Go against StandardJS, and require trailing commas.
    // Trailing commas reduce the size of diffs.
    'comma-dangle': ['warn', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      // Trailing commas for function calls are annoying.
      functions: 'only-multiline',
    }],
    // Don't allow spaces inside braces.
    'object-curly-spacing': ['warn', 'never'],
    // Require NO spaces before the function parentheses.
    'space-before-function-paren': ['warn', 'never'],
    // Complaining about unused variables is too annoying.
    'no-unused-vars': 'off',

    /**
     * Rules that expand on StandardJS are here.
     *
     * These rules enforce even stricter checks.
     */

    // Require line breaks before binary operators.
    // This follow's Knuth's style.
    'operator-linebreak': ['warn', 'before', {
      overrides: {
        '=': 'ignore',
        '+=': 'ignore',
        '-=': 'ignore',
        '*=': 'ignore',
        '/=': 'ignore',
        '%=': 'ignore',
        '**=': 'ignore',
      },
    }],
    'padding-line-between-statements': [
      'warn',
      // Require blank lines before control statements.
      {blankLine: 'always', prev: '*', next: 'block'},
      {blankLine: 'always', prev: '*', next: 'block-like'},
      {blankLine: 'always', prev: '*', next: 'break'},
      {blankLine: 'always', prev: '*', next: 'class'},
      {blankLine: 'always', prev: '*', next: 'continue'},
      {blankLine: 'always', prev: '*', next: 'do'},
      {blankLine: 'always', prev: '*', next: 'for'},
      {blankLine: 'always', prev: '*', next: 'if'},
      {blankLine: 'always', prev: '*', next: 'return'},
      {blankLine: 'always', prev: '*', next: 'switch'},
      {blankLine: 'always', prev: '*', next: 'throw'},
      {blankLine: 'always', prev: '*', next: 'try'},
      {blankLine: 'always', prev: '*', next: 'while'},
      // Do not allow blank lines before switch statement labels.
      {blankLine: 'never', prev: '*', next: 'case'},
      {blankLine: 'never', prev: '*', next: 'default'},
    ],
    // Prefer arrow functions.
    'prefer-arrow-callback': 'warn',
    // Require parentheses to make arrow function bodies less confusing.
    'no-confusing-arrow': ['error', {allowParens: true}],
    // Treat function parameters as if they are `const`.
    'no-param-reassign': 'error',
    // Prefer no quotes for properties.
    'quote-props': ['warn', 'as-needed', {
      keywords: false,
      numbers: false,
    }],

    /* typescript-eslint plugin options. */

    '@typescript-eslint/array-type': ['warn', 'array'],
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/type-annotation-spacing': ['warn', {
      before: false,
      after: true,
      overrides: {
        arrow: {
          before: true,
          after: true,
        },
      },
    }],
    '@typescript-eslint/member-delimiter-style': ['warn', {
      multiline: {delimiter: 'none'},
      singleline: {delimiter: 'comma', requireLast: false},
    }],

    /* Options for checking sorting options. */

    'import/order': ['warn', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        ['index', 'sibling'],
      ],
      'newlines-between': 'always',
    }],

    'sort-imports': ['warn', {
      ignoreDeclarationSort: true,
    }],

    // Disable ESLint warnings about undefined variables.
    // TypeScript does a better job of checking this.
    'no-undef': 'off',
  },
}
