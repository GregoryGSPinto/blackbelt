import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
