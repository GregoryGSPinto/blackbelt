import { redirect } from 'next/navigation';

// Redireciona imediatamente para landing (server-side, sem flash)
export default function HomePage() {
  redirect('/landing');
}
