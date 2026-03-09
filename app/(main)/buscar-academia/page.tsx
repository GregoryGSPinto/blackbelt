'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 

  Star,
  Clock,
  Users,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

// Mock data - substituir por API real
const mockAcademies = [
  {
    id: '1',
    name: 'Academia Gracie Barra SP',
    address: 'Rua Augusta, 1500 - Consolação, São Paulo',
    rating: 4.9,
    reviews: 128,
    modalities: ['BJJ', 'Muay Thai', 'Boxe'],
    image: '/images/academy-1.jpg',
    distance: '1.2 km',
    plans: 'A partir de R$ 199/mês',
    hours: '06:00 - 22:00',
    students: 450,
  },
  {
    id: '2',
    name: 'Checkmat Brasil',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo',
    rating: 4.8,
    reviews: 96,
    modalities: ['BJJ', 'Judo', 'Wrestling'],
    image: '/images/academy-2.jpg',
    distance: '2.5 km',
    plans: 'A partir de R$ 249/mês',
    hours: '05:30 - 23:00',
    students: 380,
  },
  {
    id: '3',
    name: 'Muay Thai Center',
    address: 'Rua Oscar Freire, 500 - Jardins, São Paulo',
    rating: 4.7,
    reviews: 84,
    modalities: ['Muay Thai', 'Boxe', 'MMA'],
    image: '/images/academy-3.jpg',
    distance: '3.1 km',
    plans: 'A partir de R$ 179/mês',
    hours: '06:00 - 21:00',
    students: 220,
  },
  {
    id: '4',
    name: 'Alliance Jiu Jitsu',
    address: 'Rua da Consolação, 800 - Consolação, São Paulo',
    rating: 4.9,
    reviews: 156,
    modalities: ['BJJ', 'Self Defense'],
    image: '/images/academy-4.jpg',
    distance: '0.8 km',
    plans: 'A partir de R$ 299/mês',
    hours: '05:00 - 22:30',
    students: 520,
  },
];

const modalities = ['Todas', 'BJJ', 'Muay Thai', 'Boxe', 'Judo', 'MMA', 'Karatê'];

export default function BuscarAcademiaPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModality, setSelectedModality] = useState('Todas');
  const [isLoading, setIsLoading] = useState(false);
  const [academies, setAcademies] = useState(mockAcademies);

  useEffect(() => {
    // Simular busca na API
    setIsLoading(true);
    const timer = setTimeout(() => {
      let filtered = mockAcademies;
      
      if (searchTerm) {
        filtered = filtered.filter(a => 
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedModality !== 'Todas') {
        filtered = filtered.filter(a => 
          a.modalities.includes(selectedModality)
        );
      }
      
      setAcademies(filtered);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, selectedModality]);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-2xl font-bold">Encontre sua academia</h1>
          <p className="text-slate-400">Busque por nome, localização ou modalidade</p>
          
          {/* Search Bar */}
          <div className="mt-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar academias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300 hover:bg-white/10">
              <MapPin className="h-5 w-5" />
              <span className="hidden sm:inline">Próximas</span>
            </button>
          </div>
          
          {/* Modality Filter */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {modalities.map((mod) => (
              <button
                key={mod}
                onClick={() => setSelectedModality(mod)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedModality === mod
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          </div>
        ) : academies.length === 0 ? (
          <div className="py-20 text-center">
            <Search className="mx-auto h-16 w-16 text-slate-600" />
            <h3 className="mt-4 text-xl font-semibold">Nenhuma academia encontrada</h3>
            <p className="mt-2 text-slate-400">Tente ajustar seus filtros de busca</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              {academies.length} {academies.length === 1 ? 'academia encontrada' : 'academias encontradas'}
            </p>
            
            {academies.map((academy, index) => (
              <motion.div
                key={academy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(`/academia/${academy.id}`)}
                className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/30 hover:bg-white/[0.07]"
              >
                <div className="flex gap-4">
                  {/* Image Placeholder */}
                  <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20">
                    <Award className="h-10 w-10 text-amber-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white truncate">{academy.name}</h3>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{academy.rating}</span>
                      </div>
                    </div>
                    
                    <p className="mt-1 text-sm text-slate-400 line-clamp-1">{academy.address}</p>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {academy.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {academy.hours}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {academy.students} alunos
                      </span>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {academy.modalities.map((mod) => (
                        <span
                          key={mod}
                          className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300"
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-400">{academy.plans}</span>
                      <button className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300">
                        Ver detalhes
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6">
          <div className="flex items-start gap-4">
            <TrendingUp className="h-6 w-6 flex-shrink-0 text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-400">Dica do BlackBelt</h3>
              <p className="mt-1 text-sm text-slate-300">
                Visite a academia antes de se matricular. Muitas oferecem aula experimental gratuita!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
