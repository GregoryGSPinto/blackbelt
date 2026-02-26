export default function InfantilPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🥋</div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Modo Infantil</h1>
        <p className="text-lg text-white/40 mb-8">
          O conteúdo infantil é acessado pelo perfil Kids. Peça ao responsável para criar um perfil Kids na área de seleção de perfis.
        </p>
        <a href="/selecionar-perfil" className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-6 py-3 rounded-full font-semibold hover:bg-amber-500/30 transition-colors">
          Selecionar Perfil
        </a>
      </div>
    </div>
  );
}
