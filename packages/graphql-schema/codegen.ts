import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: ['./src/schemas/*.graphql'],
  documents: ['./src/operations/**/*.graphql', './src/fragments/**/*.graphql'],
  generates: {
    'src/__generated__/types.ts': {
      plugins: ['typescript'],
      config: {
        useIndexSignature: true,
        enumsAsTypes: true,
      },
    },
    'src/__generated__/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        useTypeImports: true,
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
