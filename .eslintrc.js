module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  rules: {},
  overrides: [
    {
      files: ['*.ts'],
      processor: '@graphql-eslint/graphql',
      extends: ['plugin:prettier/recommended'],
    },
    {
      files: ['*.graphql'],
      parser: '@graphql-eslint/eslint-plugin',
      plugins: ['@graphql-eslint'],
      rules: {
        '@graphql-eslint/require-description': ['error', { DirectiveDefinition: true }],
        '@graphql-eslint/naming-convention': ['error', { types: 'PascalCase', FieldDefinition: 'camelCase' }],
        '@graphql-eslint/alphabetize': [
          'error',
          {
            fields: ['ObjectTypeDefinition', 'InterfaceTypeDefinition', 'InputObjectTypeDefinition'],
            values: ['EnumTypeDefinition'],
            arguments: ['FieldDefinition', 'Field', 'DirectiveDefinition', 'Directive'],
          },
        ],

        '@graphql-eslint/require-deprecation-reason': 'warn',

        '@graphql-eslint/require-id-when-available': 'warn',
        '@graphql-eslint/no-duplicate-fields': 'error',
        '@graphql-eslint/no-unused-variables': 'error',
        '@graphql-eslint/unique-argument-names': 'error',
        '@graphql-eslint/unique-field-definition-names': 'error',
        '@graphql-eslint/unique-input-field-names': 'error',
        '@graphql-eslint/unique-variable-names': 'error',
        '@graphql-eslint/unique-fragment-name': 'error',
        '@graphql-eslint/unique-operation-name': 'error',
        '@graphql-eslint/known-argument-names': 'error',
        '@graphql-eslint/no-undefined-variables': 'error',
        '@graphql-eslint/provided-required-arguments': 'error',
        '@graphql-eslint/variables-are-input-types': 'error',
        '@graphql-eslint/fields-on-correct-type': 'error',
      },
    },
  ],
  parserOptions: {
    schema: 'src/**/*.graphql',
    operations: 'src/**/*.{graphql,js,jsx,ts,tsx}',
  },
}
