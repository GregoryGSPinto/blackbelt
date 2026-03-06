/* eslint-disable @typescript-eslint/ban-ts-comment, unused-imports/no-unused-imports */
// @ts-nocheck
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { useTranslations } from 'next-intl';
import {
  listFederationsAction,
  createFederationAction,
  getFederationWithAcademiesAction,
} from '@/app/actions/federation';
import {
  Globe, Plus, Building2, Users, ChevronRight, X, Shield,
  MapPin,
} from 'lucide-react';

interface Federation {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  country: string;
  created_at: string;
}

interface FederationDetail {
  federation: Federation;
  academies: Array<{ academy_id: string; role: string; joined_at: string; academies: { id: string; name: string; slug: string } }>;
  admins: Array<{ profile_id: string; role: string; profiles: { id: string; full_name: string; email: string } }>;
}

export default function FederationPage() {
  const t = useTranslations('common');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [federations, setFederations] = useState<Federation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFed, setSelectedFed] = useState<FederationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const result = await listFederationsAction();
        if (result.success) {
          setFederations(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(handleServiceError(err, 'Federations'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const slug = newName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const result = await createFederationAction({
        name: newName.trim(),
        slug,
        description: newDescription.trim() || undefined,
      });

      if (result.success) {
        setFederations(prev => [...prev, result.data]);
        setShowCreate(false);
        setNewName('');
        setNewDescription('');
      }
    } finally {
      setCreating(false);
    }
  }, [newName, newDescription]);

  const handleSelectFederation = useCallback(async (fed: Federation) => {
    setDetailLoading(true);
    try {
      const result = await getFederationWithAcademiesAction(fed.id);
      if (result.success) {
        setSelectedFed(result.data as FederationDetail);
      }
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Search registration
  const searchItems = useMemo<SearchItem[]>(
    () =>
      federations.map((f) => ({
        id: `fed-${f.id}`,
        label: f.name,
        categoria: 'Federation',
        icon: '🌐',
        href: '/federation',
        keywords: [f.slug, f.country],
      })),
    [federations],
  );
  useSearchRegistration('federations', searchItems);

  if (loading) return <PremiumLoader text="Loading federations..." />;
  if (error) return <PageError error={error} onRetry={() => setRetryCount((c) => c + 1)} />;

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: tokens.text }}>
            <Globe className="w-6 h-6" />
            Federations
          </h1>
          <p className="mt-1 text-sm" style={{ color: tokens.textMuted }}>
            Manage martial arts federations and affiliated academies
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'var(--academy-primary, #C9A227)',
            color: '#fff',
          }}
        >
          <Plus className="w-4 h-4" />
          New Federation
        </button>
      </div>

      {/* Federation List */}
      {federations.length === 0 ? (
        <PageEmpty
          icon={Globe}
          title="No federations yet"
          description="Create your first federation to connect academies"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {federations.map((fed) => (
            <button
              key={fed.id}
              onClick={() => handleSelectFederation(fed)}
              className="text-left rounded-xl p-6 transition-all hover:scale-[1.02]"
              style={tokens.glass}
            >
              <div className="flex items-center gap-3 mb-3">
                {fed.logo_url ? (
                  <img src={fed.logo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}>
                    <Shield className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate" style={{ color: tokens.text }}>
                    {fed.name}
                  </h3>
                  <p className="text-xs" style={{ color: tokens.textMuted }}>
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {fed.country}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: tokens.textMuted }} />
              </div>
              {fed.description && (
                <p className="text-sm line-clamp-2" style={{ color: tokens.textMuted }}>
                  {fed.description}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl p-6" style={tokens.glass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: tokens.text }}>
                New Federation
              </h2>
              <button onClick={() => setShowCreate(false)}>
                <X className="w-5 h-5" style={{ color: tokens.textMuted }} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: tokens.textMuted }}>
                  Name
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Federation name"
                  className="w-full px-3 py-2 rounded-lg bg-transparent text-sm"
                  style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: tokens.textMuted }}>
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-transparent text-sm resize-none"
                  style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
              >
                {creating ? 'Creating...' : 'Create Federation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {(selectedFed || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl p-6" style={tokens.glass}>
            {detailLoading ? (
              <PremiumLoader text="Loading details..." />
            ) : selectedFed ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold" style={{ color: tokens.text }}>
                    {selectedFed.federation.name}
                  </h2>
                  <button onClick={() => setSelectedFed(null)}>
                    <X className="w-5 h-5" style={{ color: tokens.textMuted }} />
                  </button>
                </div>

                {selectedFed.federation.description && (
                  <p className="text-sm mb-6" style={{ color: tokens.textMuted }}>
                    {selectedFed.federation.description}
                  </p>
                )}

                {/* Academies */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: tokens.text }}>
                    <Building2 className="w-4 h-4" />
                    Affiliated Academies ({selectedFed.academies.length})
                  </h3>
                  {selectedFed.academies.length === 0 ? (
                    <p className="text-sm" style={{ color: tokens.textMuted }}>
                      No academies affiliated yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedFed.academies.map((m) => (
                        <div
                          key={m.academy_id}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ background: tokens.overlay }}
                        >
                          <div>
                            <p className="text-sm font-medium" style={{ color: tokens.text }}>
                              {m.academies?.name ?? m.academy_id}
                            </p>
                            <p className="text-xs" style={{ color: tokens.textMuted }}>
                              {m.role} &middot; Joined {new Date(m.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admins */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: tokens.text }}>
                    <Users className="w-4 h-4" />
                    Administrators ({selectedFed.admins.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedFed.admins.map((a) => (
                      <div
                        key={a.profile_id}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ background: tokens.overlay }}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: tokens.text }}>
                            {a.profiles?.full_name ?? a.profile_id}
                          </p>
                          <p className="text-xs capitalize" style={{ color: tokens.textMuted }}>
                            {a.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
