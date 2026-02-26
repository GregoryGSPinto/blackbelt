import { AcademyProgressProvider } from '@/lib/academy';

export default function UnidadeLayout({ children }: { children: React.ReactNode }) {
  return <AcademyProgressProvider>{children}</AcademyProgressProvider>;
}
