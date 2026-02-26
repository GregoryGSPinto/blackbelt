'use client';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-white/10 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-white/30 font-medium">Carregando...</p>
      </div>
    </div>
  );
}
