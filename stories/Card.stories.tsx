import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '@/components/ui/Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
};

export default meta;

export const Default: StoryObj<typeof Card> = {
  args: {
    header: <h3 className="text-lg font-semibold">Account balance</h3>,
    footer: <p className="text-xs text-[var(--text-secondary)]">Updated 5 mins ago</p>,
    children: (
      <p className="text-sm text-[var(--text-primary)]">
        Your account is in great shape. Keep an eye on recurring payments.
      </p>
    ),
  },
};

export const Highlighted: StoryObj<typeof Card> = {
  args: {
    variant: 'highlighted',
    children: <p className="text-[var(--text-primary)]">Special offer unlocked.</p>,
  },
};
