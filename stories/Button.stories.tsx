import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
};

export default meta;

export const Primary: StoryObj<typeof Button> = {
  args: {
    variant: 'primary',
    children: 'Confirm',
  },
};

export const Secondary: StoryObj<typeof Button> = {
  args: {
    variant: 'secondary',
    children: 'Cancel',
  },
};

export const Danger: StoryObj<typeof Button> = {
  args: {
    variant: 'danger',
    children: 'Delete',
  },
};

export const Loading: StoryObj<typeof Button> = {
  args: {
    variant: 'primary',
    loading: true,
    loadingText: 'Saving...',
  },
};
