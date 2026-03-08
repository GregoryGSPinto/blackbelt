import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from '@/components/ui/Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'UI/Spinner',
  component: Spinner,
};

export default meta;

export const Sizes: StoryObj<typeof Spinner> = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};
