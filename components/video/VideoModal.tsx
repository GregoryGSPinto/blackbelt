'use client';

import { X, ThumbsUp, Share2, Download } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import type { Video } from '@/lib/api/content.service';

interface VideoModalProps {
  video: Video;
  onClose: () => void;
}

export function VideoModal({ video, onClose }: VideoModalProps) {
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/90 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-dark-card rounded-xl max-w-[calc(100%-1rem)] sm:max-w-2xl md:max-w-5xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-dark-card border-b border-dark-elevated p-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-white line-clamp-1">
              {video.title}
            </h2>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          </div>

          {/* Video Player */}
          <div className="p-4 sm:p-6">
            <VideoPlayer 
              youtubeId={video.youtubeId}
              title={video.title}
              autoplay={true}
            />
          </div>

          {/* Video Info */}
          <div className="px-6 pb-6 space-y-4">
            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-dark-hover rounded-lg hover:bg-dark-surface transition-colors">
                <ThumbsUp size={18} />
                <span className="text-sm">Curtir</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-dark-hover rounded-lg hover:bg-dark-surface transition-colors">
                <Share2 size={18} />
                <span className="text-sm">Compartilhar</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-dark-hover rounded-lg hover:bg-dark-surface transition-colors">
                <Download size={18} />
                <span className="text-sm">Salvar</span>
              </button>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-white/40">
              <span className={`px-2 py-1 rounded font-semibold ${
                video.level === 'Iniciante' ? 'bg-green-500/20 text-green-400' :
                video.level === 'Intermediário' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {video.level}
              </span>
              <span>{video.category}</span>
              <span>•</span>
              <span>{video.duration}</span>
              <span>•</span>
              <span>{video.views} visualizações</span>
            </div>

            {/* Instructor */}
            <div className="pt-4 border-t border-dark-elevated">
              <p className="text-sm text-white/40 mb-1">Instrutor</p>
              <p className="font-semibold">{video.instructor}</p>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-dark-elevated">
              <p className="text-sm text-white/40 mb-2">Descrição</p>
              <p className="text-white/55 leading-relaxed">
                {video.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
