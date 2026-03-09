'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search,

  Play,
  Clock,
  Trophy,
  Target,
  ChevronRight,
  Star,
} from 'lucide-react';

const belts = [
  { id: 'white', name: 'Branca', color: 'from-slate-200 to-slate-400', emoji: '⚪', level: 'Fundamentos', videos: 45, progress: 0 },
  { id: 'blue', name: 'Azul', color: 'from-blue-400 to-blue-600', emoji: '🔵', level: 'Intermediário', videos: 62, progress: 0 },
  { id: 'purple', name: 'Roxa', color: 'from-purple-400 to-purple-600', emoji: '🟣', level: 'Avançado', videos: 58, progress: 0 },
  { id: 'brown', name: 'Marrom', color: 'from-amber-600 to-amber-800', emoji: '🟤', level: 'Especialista', videos: 41, progress: 0 },
  { id: 'black', name: 'Preta', color: 'from-slate-700 to-slate-900', emoji: '⚫', level: 'Mestre', videos: 73, progress: 0 },
];

const programs = [
  { id: 1, title: 'Iniciante 30 Dias', description: 'Aprenda o básico em 1 mês', duration: '4 semanas', level: 'Branca', icon: '🎯' },
  { id: 2, title: 'Guarda Fechada Mastery', description: 'Domine a guarda fechada', duration: '6 semanas', level: 'Azul', icon: '🛡️' },
  { id: 3, title: 'Passagem de Guarda', description: 'Técnicas avançadas de passagem', duration: '8 semanas', level: 'Roxa', icon: '⚔️' },
];

const recentVideos = [
  { id: 1, title: 'Estrangulamento de Guarda', duration: '8:45', instructor: 'Prof. Silva', belt: 'white', thumbnail: '/thumb1.jpg' },
  { id: 2, title: 'Armlock do Montado', duration: '12:30', instructor: 'Prof. Santos', belt: 'blue', thumbnail: '/thumb2.jpg' },
  { id: 3, title: 'De La Riva Sweep', duration: '15:20', instructor: 'Prof. Oliveira', belt: 'purple', thumbnail: '/thumb3.jpg' },
];

export default function ConteudoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('belts');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-2xl font-bold">Biblioteca de Treinos</h1>
          <p className="text-slate-400">Escolha sua faixa ou objetivo</p>
          
          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar técnica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2 border-b border-white/10">
            {[
              { id: 'belts', label: 'Por Faixa', icon: Trophy },
              { id: 'programs', label: 'Programas', icon: Target },
              { id: 'favorites', label: 'Favoritos', icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Belts Tab */}
        {activeTab === 'belts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Belt Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {belts.map((belt) => (
                <motion.div
                  key={belt.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => router.push(`/conteudo/faixa/${belt.id}`)}
                  className="cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br p-6 transition hover:border-white/20"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{belt.emoji}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                      {belt.videos} vídeos
                    </span>
                  </div>
                  
                  <h3 className="mt-4 text-xl font-bold">Faixa {belt.name}</h3>
                  <p className="text-sm text-slate-400">{belt.level}</p>
                  
                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Progresso</span>
                      <span>{belt.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${belt.color}`}
                        style={{ width: `${belt.progress}%` }}
                      />
                    </div>
                  </div>

                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-sm font-medium transition hover:bg-white/10">
                    Ver conteúdo
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Recent Videos */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold">Vídeos Recentes</h2>
              <div className="mt-4 space-y-3">
                {recentVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => router.push(`/conteudo/video/${video.id}`)}
                    className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/[0.07]"
                  >
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-amber-400/20">
                      <Play className="h-6 w-6 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{video.title}</h3>
                      <p className="text-sm text-slate-400">{video.instructor}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      {video.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {programs.map((program) => (
              <div
                key={program.id}
                onClick={() => router.push(`/conteudo/programa/${program.id}`)}
                className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/[0.07]"
              >
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-3xl">
                  {program.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{program.title}</h3>
                  <p className="text-slate-400">{program.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {program.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      Faixa {program.level}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500" />
              </div>
            ))}
          </motion.div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Star className="h-16 w-16 text-slate-600" />
            <h3 className="mt-4 text-xl font-semibold">Nenhum favorito ainda</h3>
            <p className="mt-2 text-slate-400">Marque vídeos como favoritos para acessá-los rapidamente</p>
            <button
              onClick={() => setActiveTab('belts')}
              className="mt-6 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Explorar conteúdo
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
