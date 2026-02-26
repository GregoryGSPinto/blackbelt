export interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content?: string;
}
