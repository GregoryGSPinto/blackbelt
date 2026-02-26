# API Endpoints Map — BlackBelt

> Auto-generated from `lib/api/*.service.ts`


| Service | Function | HTTP | Endpoint (sugerido) | Params | Return Type |
|---------|----------|------|---------------------|--------|-------------|
| admin | `getUsuarios` | GET | `/admin/usuarios` | `` | `Usuario[]` |
| admin | `getUsuarioById` | GET | `/admin/usuarios/${id}`);
  return data;
}

export async function getTurmas(): Promise<Turma[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.turmas]; }
  const { data } = await apiClient.get<Turma[]>(` | `id: string` | `Usuario | undefined` |
| admin | `getTurmas` | GET | `/admin/turmas` | `` | `Turma[]` |
| admin | `getTurmaById` | GET | `/admin/turmas/${id}`);
  return data;
}

export async function getCheckIns(): Promise<CheckIn[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.checkIns]; }
  const { data } = await apiClient.get<CheckIn[]>(` | `id: string` | `Turma | undefined` |
| admin | `getCheckIns` | GET | `/admin/checkins` | `` | `CheckIn[]` |
| admin | `getAlunosByTurma` | GET | `/admin/turmas/${turmaId}/alunos`);
  return data;
}

export async function getAlertas(): Promise<Alerta[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.getAlertasAtivos(); }
  const { data } = await apiClient.get<Alerta[]>(` | `turmaId: string` | `Usuario[]` |
| admin | `getAlertas` | GET | `/admin/alertas` | `` | `Alerta[]` |
| admin | `getEstatisticas` | GET | `/admin/dashboard/stats` | `` | `EstatisticasDashboard` |
| admin | `getHistoricoStatus` | GET | `/admin/historico-status` | `` | `HistoricoStatus[]` |
| admin | `getPermissoes` | GET | `/admin/permissoes` | `` | `Permissao[]` |
| admin | `getPerfilPermissoes` | GET | `/admin/perfil-permissoes` | `` | `PerfilPermissoes[]` |
| admin | `getPerfisDisponiveis` | GET | `/admin/perfis` | `` | `PerfilInfo[]` |
| admin | `getConfiguracao` | GET | `/admin/configuracao` | `` | `ConfiguracaoAcademia` |
| alertas-inteligentes | `getAlertas` | GET | `/alertas/inteligentes` | `` | `AlertaInteligente[]` |
| alertas-inteligentes | `dismissAlert` | POST | `/alertas/inteligentes` | `alertId: string` | `void` |
| alertas-inteligentes | `isDismissed` | POST | `/alertas/inteligentes` | `alertId: string` | `void` |
| alertas-inteligentes | `calcularTendencia` | POST | `/alertas/inteligentes` | `atual: number, anterior: number` | `void` |
| aluno-home | `getAlunoHomeData` | GET | `/aluno/home` | `` | `AlunoHomeData` |
| analytics | `getAnalytics` | GET | `/analytics/retencao` | `` | `AnalyticsRetencao` |
| assinatura | `getDocumentos` | GET | `/assinatura/documentos` | `` | `DocumentoAssinatura[]` |
| assinatura | `assinarDocumento` | POST | `/assinatura/documentos/${id}/assinar` | `id: string` | `DocumentoAssinatura` |
| assinatura | `getConsentimentos` | GET | `/assinatura/consentimentos` | `` | `ConsentimentoLGPD[]` |
| assinatura | `toggleConsentimento` | PUT | `/assinatura/consentimentos/${id}` | `id: string, aceito: boolean` | `ConsentimentoLGPD` |
| auth | `secureLogin` | POST | `/auth` | `credentials: LoginRequest` | `SecureLoginResult` |
| auth | `secureLogout` | POST | `/auth` | `` | `void` |
| auth | `secureLogoutAll` | POST | `/auth` | `` | `void` |
| auth | `reauthenticate` | POST | `/auth/reauth` | `password: string` | `boolean` |
| auth | `changePassword` | POST | `/auth/change-password` | `currentPassword: string, newPassword: string` | `boolean` |
| auth | `login` | POST | `/auth` | `credentials: LoginRequest` | `LoginResponse | null` |
| auth | `register` | POST | `/auth` | `data: RegisterRequest` | `RegisterResponse | null` |
| auth | `checkEmailAvailable` | POST | `/auth/check-email` | `email: string` | `boolean` |
| auth | `registerFull` | POST | `/auth/register` | `data: RegisterFullRequest` | `RegisterResponse | null` |
| automacoes | `getAutomacoes` | GET | `/automacoes` | `` | `Automacao[]` |
| automacoes | `updateAutomacao` | PUT | `/automacoes/${id}` | `id: string, data: Partial<Automacao>` | `Automacao` |
| automacoes | `toggleAutomacao` | PUT | `/automacoes/${id}/toggle` | `id: string, ativa: boolean` | `Automacao` |
| carteirinha | `getMinhaCarteirinha` | GET | `/carteirinha/me` | `` | `CarteirinhaDigital` |
| carteirinha | `getAtletaPublico` | GET | `/atleta/${id}` | `id: string` | `AtletaPublico | null` |
| checkin | `registerCheckin` | POST | `/checkin` | `alunoId: string,
  turmaId: string,
  method: C...` | `CheckInResult` |
| checkin | `validateAndCheckin` | POST | `/checkin/validate-qr` | `qrPayload: CheckInQR` | `CheckInResult` |
| checkin | `getCheckinHistory` | GET | `/checkin` | `alunoId?: string,
  dateRange?: { from: string;...` | `CheckIn[]` |
| checkin | `getTodayCheckins` | GET | `/checkin/today` | `` | `CheckIn[]` |
| comunicacoes | `getComunicados` | GET | `/comunicacoes/comunicados` | `` | `Comunicado[]` |
| comunicacoes | `createComunicado` | POST | `/comunicacoes` | `comunicado: Omit<Comunicado, 'id' | 'dataCriaca...` | `Comunicado` |
| comunicacoes | `getMensagens` | GET | `/comunicacoes/mensagens` | `` | `MensagemDireta[]` |
| comunicacoes | `sendMensagem` | POST | `/comunicacoes/mensagens` | `msg: Omit<MensagemDireta, 'id' | 'data' | 'lida'>` | `MensagemDireta` |
| comunicacoes | `getStats` | GET | `/comunicacoes/stats` | `` | `ComunicacoesStats` |
| content | `getVideos` | GET | `/content` | `filters?: {
  category?: string;
  level?: Vide...` | `Video[]` |
| content | `getSeries` | GET | `/content/series` | `` | `Serie[]` |
| content | `getTop10` | GET | `/content/top10` | `` | `Video[]` |
| content | `getVideoById` | GET | `/content/videos/${id}` | `id: string` | `Video | null` |
| content | `getRelatedVideos` | GET | `/content` | `video: Video, limit = 8` | `Video[]` |
| eventos | `getEventos` | GET | `/eventos` | `filtros?: EventosFiltros` | `Evento[]` |
| eventos | `getEvento` | GET | `/eventos` | `id: string` | `Evento | null` |
| eventos | `inscreverEvento` | POST | `/eventos` | `eventoId: string,
  data: { categoriaId: string...` | `InscricaoEvento` |
| eventos | `criarEvento` | POST | `/eventos` | `data: Partial<Evento>` | `Evento` |
| eventos | `atualizarEvento` | POST | `/eventos/${id}` | `id: string, data: Partial<Evento>` | `Evento` |
| eventos | `excluirEvento` | POST | `/eventos/${id}`);
}

/** Registrar resultados de evento (admin) */
export async function registrarResultados(
  eventoId: string,
  resultados: InscricaoEvento[]
): Promise<void> {
  if (useMock()) {
    await mockDelay(400);
    return;
  }

  return apiClient.put(`/eventos/${eventoId}/resultados` | `id: string` | `void` |
| eventos | `registrarResultados` | POST | `/eventos/${eventoId}/resultados`, { resultados });
}

/** Exportar inscritos como CSV (client-side) */
export function exportarInscritosCSV(evento: Evento): string {
  const header = ` | `eventoId: string,
  resultados: InscricaoEvento[]` | `void` |
| eventos | `exportarInscritosCSV` | POST | `/eventos` | `evento: Evento` | `void` |
| evolucao | `getEvolucaoData` | GET | `/aluno/evolucao` | `` | `EvolucaoData` |
| gateway | `criarCobranca` | POST | `/gateway/cobrancas` | `req: CriarCobrancaRequest` | `Cobranca` |
| gateway | `consultarCobranca` | POST | `/gateway/cobrancas/${id}` | `id: string` | `Cobranca` |
| gateway | `cancelarCobranca` | POST | `/gateway/cobrancas/${id}`);
}

export async function configurarRecorrencia(config: RecorrenciaConfig): Promise<Recorrencia> {
  if (useMock()) {
    await mockDelay(500);
    return { id: `rec_${Date.now().toString(36)}`, alunoId: config.alunoId, planoId: config.planoId, status: ` | `id: string` | `void` |
| gateway | `configurarRecorrencia` | POST | `/gateway/recorrencias` | `config: RecorrenciaConfig` | `Recorrencia` |
| gateway | `cancelarRecorrencia` | POST | `/gateway/recorrencias/${id}`);
}

export async function listarWebhooks(limit?: number): Promise<WebhookEvent[]> {
  if (useMock()) {
    await mockDelay();
    return [
      { id: ` | `id: string` | `void` |
| gateway | `listarWebhooks` | GET | `/gateway/webhooks?limit=${limit || 20}` | `limit?: number` | `WebhookEvent[]` |
| graduacao | `getExames` | GET | `/graduacao/exames` | `` | `ExameGraduacao[]` |
| graduacao | `getRequisitos` | GET | `/graduacao/requisitos` | `` | `RequisitoGraduacao[]` |
| graduacao | `getMinhaGraduacao` | GET | `/graduacao/minha` | `` | `GraduacaoHistorico[]` |
| graduacao | `agendarExame` | POST | `/graduacao/exames` | `data: Partial<ExameGraduacao>` | `ExameGraduacao` |
| graduacao | `avaliarExame` | POST | `/graduacao/exames/${id}` | `id: string, status: 'APROVADO' | 'REPROVADO', o...` | `ExameGraduacao` |
| graduacao | `getSubníveisAlunos` | GET | `/graduacao/subníveis` | `` | `GrauAluno[]` |
| graduacao | `adicionarGrau` | POST | `/graduacao` | `alunoId: string, professor: string` | `GrauAluno` |
| graduacao | `removerGrau` | DELETE | `/graduacao/subníveis/${alunoId}/remover` | `alunoId: string, motivo: string` | `GrauAluno` |
| graduacao | `getMeusSubníveis` | GET | `/graduacao/meus-subníveis` | `` | `{ subníveisAtuais: number; dataUltimoGrau?: string }` |
| kids-safety | `getPessoasAutorizadas` | GET | `/kids-safety/autorizados${responsavelId ? `?responsavelId=${responsavelId}` : ` | `responsavelId?: string` | `PessoaAutorizada[]` |
| kids-safety | `getPessoasPorAluno` | GET | `/kids-safety/autorizados?alunoId=${alunoId}`); return data;
}

export async function addPessoaAutorizada(payload: Omit<PessoaAutorizada, ` | `alunoId: string` | `PessoaAutorizada[]` |
| kids-safety | `addPessoaAutorizada` | POST | `/kids-safety/autorizados` | `payload: Omit<PessoaAutorizada, 'id' | 'dataCad...` | `PessoaAutorizada` |
| kids-safety | `togglePessoaAutorizada` | PUT | `/kids-safety/autorizados/${id}` | `id: string, ativa: boolean` | `PessoaAutorizada` |
| kids-safety | `removePessoaAutorizada` | DELETE | `/kids-safety/autorizados/${id}`);
}

// ── Saídas ────────────────────────────────────────────────

export async function registrarSaida(alunoId: string, pessoaAutorizadaId: string, validadoPor: string, metodo: AutorizacaoSaida[` | `id: string` | `void` |
| kids-safety | `registrarSaida` | POST | `/kids/safety` | `alunoId: string, pessoaAutorizadaId: string, va...` | `AutorizacaoSaida` |
| kids-safety | `getHistoricoSaidas` | GET | `/kids-safety/saidas${alunoId ? `?alunoId=${alunoId}` : ` | `alunoId?: string` | `AutorizacaoSaida[]` |
| kids | `getKidsProfiles` | GET | `/kids` | `parentId?: string` | `KidProfile[]` |
| kids | `getTeenProfiles` | GET | `/kids` | `parentId?: string` | `TeenProfile[]` |
| kids | `getParentProfiles` | GET | `/kids/parents` | `` | `ParentProfile[]` |
| kids | `getChallenges` | GET | `/kids/challenges` | `` | `KidsChallenge[]` |
| kids | `getMedals` | GET | `/kids/medals` | `` | `KidsMedal[]` |
| kids | `getMascots` | GET | `/kids/mascots` | `` | `KidsMascot[]` |
| kids | `getKidsCheckins` | GET | `/kids` | `kidId?: string` | `KidsCheckin[]` |
| kids | `getKidProfileByUserId` | GET | `/kids/profile?userId=${userId}` | `userId: string` | `KidProfile | null` |
| leads | `getLeads` | GET | `/leads` | `` | `Lead[]` |
| leads | `createLead` | POST | `/leads` | `lead: Omit<Lead, 'id' | 'dataCriacao'>` | `Lead` |
| leads | `updateLead` | PUT | `/leads/${id}` | `id: string, updates: Partial<Lead>` | `Lead` |
| leads | `moverEtapa` | POST | `/leads/${leadId}/etapa` | `leadId: string, novaEtapa: LeadEtapa` | `Lead` |
| leads | `getStats` | GET | `/leads/stats` | `` | `FunnelStats` |
| leads | `deleteLead` | DELETE | `/leads/${id}` | `id: string` | `void` |
| conquistas | `getConquistasDisponiveis` | GET | `/conquistas` | `` | `ConquistaDisponivel[]` |
| conquistas | `concederConquista` | POST | `/alunos/${alunoId}/conquistas` | `alunoId: string,
  conquistaId: string,
  observa...` | `ConquistaConcessao` |
| conquistas | `getConquistasAluno` | GET | `/alunos/${alunoId}/conquistas` | `alunoId: string` | `ConquistaConcessao[]` |
| mensagens | `getConversas` | GET | `/mensagens/conversas` | `` | `Conversa[]` |
| mensagens | `getConversaMensagens` | GET | `/mensagens` | `conversaId: string` | `Mensagem[]` |
| mensagens | `getConversaByUser` | GET | `/mensagens` | `userId: string` | `Conversa | null` |
| mensagens | `getUnreadCount` | GET | `/mensagens` | `` | `number` |
| mensagens | `sendMessage` | POST | `/mensagens` | `conversaId: string,
  conteudo: string,
  remet...` | `Mensagem` |
| mensagens | `sendTemplateMessage` | POST | `/mensagens` | `conversaId: string,
  templateTexto: string,
  ...` | `Mensagem` |
| mensagens | `markAsRead` | POST | `/mensagens` | `conversaId: string` | `void` |
| mensagens | `getTemplates` | GET | `/mensagens` | `` | `MensagemTemplate[]` |
| minhas-turmas | `getMinhasTurmas` | GET | `/aluno/turmas` | `` | `TurmaAluno[]` |
| pagamentos | `getPlanos` | GET | `/pagamentos/planos` | `` | `Plano[]` |
| pagamentos | `getAssinaturas` | GET | `/pagamentos` | `alunoId?: string` | `Assinatura[]` |
| pagamentos | `getFaturas` | GET | `/pagamentos` | `alunoId?: string` | `Fatura[]` |
| pagamentos | `gerarPix` | POST | `/pagamentos/pix/gerar` | `req: PixPaymentRequest` | `PixPaymentResponse` |
| pagamentos | `getResumoAluno` | GET | `/pagamentos/resumo/${alunoId}` | `alunoId: string` | `ResumoFinanceiroAluno` |
| pagamentos | `getAdminFinanceDashboard` | GET | `/pagamentos/admin/dashboard` | `` | `AdminFinanceDashboard` |
| particulares | `getParticulares` | GET | `/particulares` | `` | `AulaParticular[]` |
| particulares | `getComissoes` | GET | `/particulares` | `mes?: string` | `Comissao[]` |
| particulares | `getInstrutoresSplit` | GET | `/particulares/instrutores` | `` | `void` |
| pdv | `getProdutos` | GET | `/pdv/estoque` | `` | `ProdutoEstoque[]` |
| pdv | `getVendas` | GET | `/pdv/vendas` | `` | `VendaBalcao[]` |
| pdv | `registrarVenda` | POST | `/pdv/venda` | `itens: ItemVenda[], clienteId?: string, cliente...` | `VendaBalcao` |
| pdv | `getMovimentos` | GET | `/pdv/estoque/movimentos` | `` | `MovimentoEstoque[]` |
| pdv | `getContas` | GET | `/pdv/contas` | `` | `ContaAluno[]` |
| pdv | `getStats` | GET | `/pdv/stats` | `` | `void` |
| perfil-estendido | `getPerfilEstendido` | GET | `/perfil/estendido` | `` | `PerfilEstendido` |
| perfil-estendido | `getModalidadesInfo` | GET | `/perfil/modalidades` | `` | `void` |
| perfil-estendido | `getCategoriasInfo` | GET | `/perfil/categorias` | `` | `void` |
| plano-sessão | `getTecnicas` | GET | `/plano-aula/tecnicas` | `` | `TecnicaBJJ[]` |
| plano-sessão | `getPlanos` | GET | `/plano-aula/planos${dateFilter ? `?data=${dateFilter}` : ` | `dateFilter?: string` | `PlanoAula[]` |
| plano-sessão | `getTemplates` | GET | `/plano-aula/templates` | `` | `PlanoAula[]` |
| plano-sessão | `salvarPlano` | POST | `/plano-aula/planos` | `plano: Omit<PlanoAula, 'id'>` | `PlanoAula` |
| plano-sessão | `deletarPlano` | POST | `/plano-aula/planos/${id}` | `id: string` | `void` |
| playlist | `getPlaylistsByProfessor` | GET | `/playlists?profId=${profId}`).then(r => r.data);
}

export async function getPlaylistsForAluno(alunoId: string): Promise<Playlist[]> {
  if (useMock()) { await mockDelay(250); const m = await getMock(); return m.getPlaylistsForAluno(alunoId); }
  return apiClient.get<Playlist[]>(` | `profId: string` | `Playlist[]` |
| playlist | `getPlaylistsForAluno` | GET | `/playlists/aluno/${alunoId}` | `alunoId: string` | `Playlist[]` |
| playlist | `createPlaylist` | POST | `/playlists` | `profId: string, input: PlaylistCreateInput` | `Playlist` |
| playlist | `updatePlaylist` | PUT | `/playlists/${id}` | `id: string, input: PlaylistCreateInput` | `Playlist` |
| playlist | `deletePlaylist` | DELETE | `/playlists/${id}`);
}

export async function addVideoToPlaylist(playlistId: string, videoId: string): Promise<void> {
  if (useMock()) { await mockDelay(200); const m = await getMock(); return m.addVideoToPlaylist(playlistId, videoId); }
  await apiClient.post(`/playlists/${playlistId}/videos` | `id: string` | `void` |
| playlist | `addVideoToPlaylist` | POST | `/playlists/${playlistId}/videos` | `playlistId: string, videoId: string` | `void` |
| playlist | `removeVideoFromPlaylist` | DELETE | `/playlists/${playlistId}/videos/${videoId}` | `playlistId: string, videoId: string` | `void` |
| professor-pedagogico | `getAlunosPaginated` | GET | `/professor/pedagogico` | `params: AlunoQueryParams = {}` | `PaginatedResponse<AlunoPedagogico` |
| professor-pedagogico | `getAlunos` | GET | `/professor/pedagogico` | `categoria?: CategoriaAluno` | `AlunoPedagogico[]` |
| professor-pedagogico | `getAlunoById` | GET | `/professor/pedagogico/alunos/${id}` | `id: string` | `AlunoPedagogico | null` |
| professor-pedagogico | `getEstatisticas` | GET | `/professor/pedagogico/estatisticas` | `` | `EstatisticasPedagogicas` |
| professor-pedagogico | `getAlunosBaixaFrequencia` | GET | `/professor/pedagogico/alunos/baixa-frequencia?threshold=${threshold}` | `threshold = 60` | `AlunoPedagogico[]` |
| professor-pedagogico | `getAlunosDestaque` | GET | `/professor/pedagogico/alunos/destaque` | `` | `AlunoPedagogico[]` |
| professor-pedagogico | `getAlunosAptoGraduacao` | GET | `/professor/pedagogico/alunos/aptos-graduacao` | `` | `AlunoPedagogico[]` |
| professor-pedagogico | `getLogs` | GET | `/professor/pedagogico` | `alunoId?: string` | `LogPedagogico[]` |
| professor-pedagogico | `updateProgresso` | PUT | `/professor/pedagogico` | `alunoId: string,
  payload: UpdateProgressoPayload` | `WriteResult` |
| professor-pedagogico | `addObservacao` | POST | `/professor/pedagogico` | `alunoId: string, texto: string, tipo: 'positiva...` | `WriteResult` |
| professor-pedagogico | `concederConquista` | POST | `/professor/pedagogico` | `alunoId: string, nome: string, emoji: string, d...` | `WriteResult` |
| professor-pedagogico | `criarAvaliacao` | POST | `/professor/pedagogico` | `alunoId: string,
  tipo: 'tecnica' | 'graduacao...` | `WriteResult` |
| professor-pedagogico | `excluirAula` | POST | `/professor/pedagogico` | `aulaId: string` | `WriteResult` |
| professor | `getDashboard` | GET | `/professor/dashboard` | `` | `ProfessorDashboard` |
| professor | `getTurmas` | GET | `/professor/turmas` | `` | `TurmaResumo[]` |
| professor | `getAvaliacoes` | GET | `/professor/avaliacoes` | `` | `AvaliacaoPendente[]` |
| professor | `getVideos` | GET | `/professor/videos` | `` | `VideoRecente[]` |
| professor | `getAlunosProgresso` | GET | `/professor/alunos-progresso` | `` | `AlunoProgresso[]` |
| professor | `getAtividades` | GET | `/professor/atividades` | `` | `AtividadeRecente[]` |
| professor | `getChamadaAlunos` | GET | `/professor/chamada/${turmaId}`);
  return data;
}

export async function salvarChamada(payload: { turmaId: string; data: string; presencas: { alunoId: string; status: ` | `turmaId: string` | `AlunoPresenca[]` |
| professor | `salvarChamada` | POST | `/professor/chamada/${payload.turmaId}/salvar` | `payload: { turmaId: string; data: string; prese...` | `ChamadaResumo` |
| progresso | `quickUpdateProgress` | POST | `/progresso` | `alunoId: string,
  update: { categoria: Categor...` | `ProgressoUpdate` |
| progresso | `getProgressoResumo` | GET | `/alunos/${alunoId}/progresso` | `alunoId: string` | `ProgressoResumo` |
| push | `enviarPush` | POST | `/push/enviar` | `notif: PushNotification` | `PushResult` |
| push | `enviarParaTopico` | POST | `/push/topico` | `topico: string, titulo: string, corpo: string` | `PushResult` |
| push | `registrarToken` | POST | `/push/tokens` | `userId: string, fcmToken: string, platform: 'we...` | `void` |
| push | `desregistrarToken` | POST | `/push/tokens/${userId}`);
}

/**
 * Solicita permissão de notificação no navegador.
 * Retorna o token FCM se concedida, ou null se negada.
 *
 * TODO(BE-035): Implementar com Firebase SDK real
 */
export async function solicitarPermissao(): Promise<string | null> {
  if (typeof window === ` | `userId: string` | `void` |
| push | `solicitarPermissao` | POST | `/push` | `` | `string | null` |
| ranking | `getRanking` | GET | `/ranking` | `filtros?: RankingFiltros` | `RankingEntry[]` |
| ranking | `getMinhaPosicao` | GET | `/ranking/me` | `alunoId?: string` | `RankingEntry` |
| ranking | `getPontosResumo` | GET | `/ranking/pontos/resumo` | `` | `PontosResumo` |
| ranking | `getPontosConfig` | GET | `/ranking/config/pontos` | `` | `PontoRegra[]` |
| ranking | `updatePontoRegra` | PUT | `/ranking/config/pontos/${id}` | `id: string, data: Partial<PontoRegra>` | `PontoRegra` |
| relatorios | `getConfigs` | GET | `/relatorios/config` | `` | `RelatorioConfig[]` |
| relatorios | `gerarRelatorio` | POST | `/relatorios/gerar` | `tipo: TipoRelatorio,
  periodo: PeriodoRelatorio` | `RelatorioGerado` |
| relatorios | `exportarCSV` | POST | `/relatorios` | `relatorio: RelatorioGerado` | `void` |
| relatorios | `exportarXLSX` | POST | `/relatorios` | `relatorio: RelatorioGerado` | `void` |
| relatorios | `exportarRelatorio` | POST | `/relatorios` | `relatorio: RelatorioGerado, formato: FormatoExp...` | `void` |
| shop | `getProducts` | GET | `/shop` | `filters?: {
  category?: Product['category'];
 ...` | `Product[]` |
| shop | `getProductById` | GET | `/shop/products/${id}`);
  return data;
}

export async function getNewProductsList(): Promise<Product[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.getNewProducts(); }
  const { data } = await apiClient.get<Product[]>(` | `id: string` | `Product | undefined` |
| shop | `getNewProductsList` | GET | `/shop/products?filter=new` | `` | `Product[]` |
| shop | `getBestSellersList` | GET | `/shop/products?filter=bestsellers` | `` | `Product[]` |
| shop | `getFeatured` | GET | `/shop/products/featured` | `` | `Product` |
| shop | `getSizeGuide` | GET | `/shop/size-guide?kids=${isKids}` | `isKids = false` | `SizeGuideTable[]` |
| storage | `validarArquivo` | POST | `/storage` | `bucket: StorageBucket, arquivo: File` | `void` |
| storage | `upload` | POST | `/storage` | `req: UploadRequest` | `UploadResponse` |
| storage | `getPresignedUrl` | GET | `/storage/presigned-url` | `req: PresignedUrlRequest` | `PresignedUrlResponse` |
| storage | `getUrl` | GET | `/storage/url?key=${encodeURIComponent(key)}`);
  return data.url;
}

export async function deletar(key: string): Promise<void> {
  if (useMock()) { await mockDelay(200); return; }
  await apiClient.delete(`/storage/files?key=${encodeURIComponent(key)}` | `key: string` | `string` |
| storage | `deletar` | POST | `/storage/files?key=${encodeURIComponent(key)}` | `key: string` | `void` |
| storage | `getStats` | GET | `/storage` | `` | `StorageStats` |
| teen | `getTeenProfiles` | GET | `/teen` | `responsavelId?: string` | `TeenProfile[]` |
| teen | `getTeenSessões` | GET | `/teen` | `faixa?: string` | `TeenAula[]` |
| teen | `getConquistas` | GET | `/teen/conquistas` | `` | `TeenConquista[]` |
| teen | `getTeenCheckins` | GET | `/teen/checkins` | `` | `TeenCheckin[]` |
| turma-broadcast | `sendToTurma` | POST | `/turma/broadcast` | `turmaId: string, turmaNome: string,
  remetente...` | `TurmaBroadcast` |
| turma-broadcast | `getBroadcastsByProfessor` | GET | `/turma/broadcast` | `profId: string` | `TurmaBroadcast[]` |
| turma-broadcast | `getBroadcastsForAluno` | GET | `/turma/broadcast` | `alunoId: string` | `TurmaBroadcast[]` |
| turma-broadcast | `getTemplates` | GET | `/turma/broadcast` | `` | `BroadcastTemplate[]` |
| turma-broadcast | `markBroadcastRead` | POST | `/turma/broadcast` | `broadcastId: string, alunoId: string` | `void` |
| video-management | `getVideosByProfessor` | GET | `/professor/videos?profId=${profId}` | `profId: string` | `Video[]` |
| video-management | `createVideo` | POST | `/professor/videos` | `profId: string, input: VideoCreateInput` | `Video` |
| video-management | `updateVideo` | PUT | `/professor/videos/${videoId}` | `videoId: string, input: VideoUpdateInput` | `Video` |
| video-management | `deleteVideo` | DELETE | `/professor/videos/${videoId}` | `videoId: string` | `void` |
| video-progress | `markAsWatched` | POST | `/video/progress` | `videoId: string` | `void` |
| video-progress | `toggleFavorite` | PUT | `/video/progress` | `videoId: string` | `boolean` |
| video-progress | `isWatched` | POST | `/video/progress` | `videoId: string` | `void` |
| video-progress | `isFavorite` | POST | `/video/progress` | `videoId: string` | `void` |
| video-progress | `getProgressSummary` | GET | `/video/progress` | `` | `VideoProgressSummary` |
| video-progress | `getWatchHistory` | GET | `/video/progress` | `limit = 10` | `WatchRecord[]` |
| video-progress | `getWatchedSet` | GET | `/video/progress` | `` | `Set<string` |
| visitantes | `getVisitantes` | GET | `/visitantes` | `` | `Visitante[]` |
| visitantes | `getVisitantesStats` | GET | `/visitantes/stats` | `` | `void` |
| whatsapp-business | `enviarMensagem` | POST | `/whatsapp/enviar` | `envio: EnvioWhatsApp` | `RespostaEnvio` |
| whatsapp-business | `enviarEmLote` | POST | `/whatsapp/enviar-lote` | `envios: EnvioWhatsApp[]` | `EnvioLoteResult` |
| whatsapp-business | `getStatusMensagem` | GET | `/whatsapp/status/${id}` | `id: string` | `RespostaEnvio` |
| whatsapp-business | `getStats` | GET | `/whatsapp/stats` | `` | `WhatsAppStats` |

**Total: 214 endpoints across 41 services**