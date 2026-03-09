'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChevronLeft,
  Upload,
  Video,
  FileText,
  Tag,
  Award,
  AlertCircle,
  X
} from 'lucide-react';

const categories = [
  { id: 'technique', name: 'Técnica', icon: '🥋' },
  { id: 'warmup', name: 'Aquecimento', icon: '🔥' },
  { id: 'complementary', name: 'Complementar', icon: '💪' },
  { id: 'drill', name: 'Drill', icon: '🔄' },
];

const beltLevels = [
  { id: 'white', name: 'Branca', color: 'bg-slate-200' },
  { id: 'blue', name: 'Azul', color: 'bg-blue-500' },
  { id: 'purple', name: 'Roxa', color: 'bg-purple-500' },
  { id: 'brown', name: 'Marrom', color: 'bg-amber-700' },
  { id: 'black', name: 'Preta', color: 'bg-slate-900' },
  { id: 'all', name: 'Todas', color: 'bg-gradient-to-r from-slate-200 via-blue-500 to-purple-500' },
];

export default function UploadVideoPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    beltLevel: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Título é obrigatório';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.beltLevel) newErrors.beltLevel = 'Faixa é obrigatória';
    if (!file) newErrors.file = 'Vídeo é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setErrors(prev => ({ ...prev, file: '' }));
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simular progresso de upload
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Simular tempo total de upload
    await new Promise(resolve => setTimeout(resolve, 5500));
    
    clearInterval(interval);
    setIsUploading(false);
    router.push('/professor-videos');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await simulateUpload();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white/10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Upload de Vídeo</h1>
              <p className="text-sm text-slate-400">Adicione conteúdo para seus alunos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* File Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Arquivo de Vídeo
            </label>
            
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition ${
                  dragActive
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/20">
                  <Upload className="h-8 w-8 text-amber-400" />
                </div>
                <p className="mt-4 font-medium text-white">
                  Arraste um vídeo ou clique para selecionar
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  MP4, MOV ou AVI até 500MB
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/20">
                    <Video className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="rounded-full p-2 text-slate-400 transition hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Enviando...</span>
                      <span className="text-amber-400">{uploadProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-amber-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {errors.file && (
              <p className="mt-2 flex items-center gap-1 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                {errors.file}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <FileText className="h-4 w-4" />
              Título do Vídeo
            </label>
            <input
              type="text"
              placeholder="Ex: Passagem de Guarda Fundamentals"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Descrição (opcional)
            </label>
            <textarea
              placeholder="Descreva a técnica e pontos importantes..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Tag className="h-4 w-4" />
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateField('category', cat.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    formData.category === cat.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Belt Level */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Award className="h-4 w-4" />
              Faixa Indicada
            </label>
            <div className="grid grid-cols-3 gap-2">
              {beltLevels.map((belt) => (
                <button
                  key={belt.id}
                  type="button"
                  onClick={() => updateField('beltLevel', belt.id)}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                    formData.beltLevel === belt.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full ${belt.color}`} />
                  <span className="text-sm font-medium">{belt.name}</span>
                </button>
              ))}
            </div>
            {errors.beltLevel && (
              <p className="mt-1 text-sm text-red-400">{errors.beltLevel}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isUploading}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-4 font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 rounded-xl bg-amber-400 py-4 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Enviando...
                </span>
              ) : (
                'Publicar Vídeo'
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
