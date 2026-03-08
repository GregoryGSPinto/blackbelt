import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
};

export default meta;

export const Default: StoryObj<typeof Input> = {
  args: {
    label: 'Full name',
    placeholder: 'Enter your name',
  },
};

export const WithHint: StoryObj<typeof Input> = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    hint: 'We will never share your email.',
  },
};

export const ErrorState: StoryObj<typeof Input> = {
  args: {
    label: 'Phone',
    placeholder: '+55 (11) 99999-9999',
    error: 'Invalid phone number',
  },
};
