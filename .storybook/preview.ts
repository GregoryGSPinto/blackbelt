import type { Preview } from '@storybook/nextjs';
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on.*' },
    controls: { expanded: true },
  },
};

export default preview;
