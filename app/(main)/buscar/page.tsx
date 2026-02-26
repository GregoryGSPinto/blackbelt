'use client';

import { useState, useEffect } from 'react';
import { Search, Play, ExternalLink } from 'lucide-react';
import VideoCard from '@/components/ui/VideoCard';
import * as contentService from '@/lib/api/content.service';
import type { Video, Serie } from '@/lib/api/content.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';

export default function BuscarPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const data = await contentService.getVideos();
        setVideos(data);
      } catch (err) {
        setError(handleServiceError(err, 'Buscar'));

      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-white/60">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  // Vídeos para busca (SEM takedowns)
  const allVideos = videos;

  // Vídeos mais buscados (links reais do YouTube)
  const maisBuscados = [
    {
      id: '1',
      youtubeId: '3sv8YS6V1n4',
      title: 'Fundamentos de Guarda Fechada',
      instructor: 'Professor Marcelo',
      category: 'Técnicas Essenciais'
    },
    {
      id: '2',
      youtubeId: '0QDgz6cD4LQ',
      title: 'Passagem de Guarda Avançada',
      instructor: 'Professor Carlos',
      category: 'Nível Intermediário'
    },
    {
      id: '3',
      youtubeId: '9VhHuMtdV38',
      title: 'Defesa e Contra-Ataque',
      instructor: 'Professor Renato',
      category: 'Defesa'
    },
    {
      id: '4',
      youtubeId: 'NJV0HIN5GWI',
      title: 'Finalizações de Guarda',
      instructor: 'Professor Bruno',
      category: 'Ataque'
    },
  ];

  const filteredVideos = searchTerm
    ? allVideos.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsSearching(value.length > 0);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Search Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          Buscar Conteúdo
        </h1>
        
        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/60 transition-colors" size={24} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Busque por sessões, técnicas, instrutores..."
            className="w-full pl-14 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-200 text-lg"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      {isSearching ? (
        <div className="max-w-7xl mx-auto">
          {filteredVideos.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-6 text-white/80">
                {filteredVideos.length} {filteredVideos.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-2xl">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold mb-2">Nenhum resultado encontrado</h2>
              <p className="text-white/60">
                Tente buscar por outro termo ou navegue pelas categorias
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Sugestões */
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Sugestões de Busca</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'Passagem de Guarda', 
              'Finalizações', 
              'Defesas', 
              'Raspagens', 
              'Montada', 
              'Joelho na Barriga',
              'Berimbolo',
              'Leg Locks'
            ].map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="p-4 bg-white/10 backdrop-blur-sm rounded-xl text-center hover:bg-white/20 hover:scale-105 transition-all duration-200 border border-white/10 hover:border-white/30 group"
              >
                <p className="font-medium text-white">{term}</p>
              </button>
            ))}
          </div>

          {/* Mais Buscados - Links Reais YouTube */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Mais Buscados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {maisBuscados.map((video) => (
                <a
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-3 shadow-lg hover:shadow-2xl transition-all duration-300">
                    {/* YouTube Thumbnail */}
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Play Button + External Link */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-2xl">
                        <Play size={18} fill="black" className="text-black" />
                        <span className="text-black font-semibold text-sm">Assistir no YouTube</span>
                        <ExternalLink size={16} className="text-black" />
                      </div>
                    </div>

                    {/* YouTube Badge */}
                    <div className="absolute top-2 left-2 bg-red-600 px-2.5 py-1 rounded-md text-xs font-bold shadow-lg">
                      YouTube
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-white line-clamp-2 group-hover:text-white transition-colors leading-snug">
                      {video.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span className="text-white/55">{video.instructor}</span>
                      <span className="text-white/30">•</span>
                      <span>{video.category}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
