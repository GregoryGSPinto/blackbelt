import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(tsx|mdx)', '../stories/**/*.stories.@(tsx|mdx)'],
  staticDirs: ['../public'],
  addons: [],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: true,
  },
};

export default config;
