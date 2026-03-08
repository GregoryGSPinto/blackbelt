import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ComponentProps } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
};

export default meta;

type ModalProps = ComponentProps<typeof Modal>;

export const Default: StoryObj<typeof Modal> = {
  render: (args: ModalProps) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          title="Modal title"
          description="A short message describing the modal purpose."
        >
          <p className="text-sm text-[var(--text-primary)]">
            This modal demonstrates the default content area and footer actions.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </div>
        </Modal>
      </div>
    );
  },
  args: {
    footer: null,
  },
};
