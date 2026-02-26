#!/usr/bin/env bash

# ════════════════════════════════════════════════════════════
# BLACKBELT — Backup & Restore Validation
#
# Executa teste completo de backup/restore com métricas.
#
# Pré-requisitos:
#   - AWS CLI configurado (aws configure)
#   - psql instalado
#   - Permissões: rds:CreateDBSnapshot, rds:RestoreDBInstanceFromDBSnapshot,
#     rds:DescribeDBInstances, rds:DeleteDBInstance, rds:DescribeDBSnapshots
#
# Uso:
#   export DB_INSTANCE=blackbelt-production
#   export DB_NAME=blackbelt
#   export DB_USER=blackbelt_admin
#   export DB_PASSWORD=<password>
#   export AWS_REGION=sa-east-1
#   bash scripts/backup-restore-test.sh
#
# Variáveis opcionais:
#   RESTORE_INSTANCE    Nome da instância de restore (default: blackbelt-restore-test)
#   RESTORE_CLASS       Classe da instância (default: db.t3.medium)
#   SKIP_CLEANUP        "true" para não deletar instância de teste
#   REPORT_FILE         Path do relatório (default: backup-restore-report.json)
# ════════════════════════════════════════════════════════════

set -euo pipefail

# ── Config ──
DB_INSTANCE="${DB_INSTANCE:?Defina DB_INSTANCE (ex: blackbelt-production)}"
DB_NAME="${DB_NAME:-blackbelt}"
DB_USER="${DB_USER:-blackbelt_admin}"
DB_PASSWORD="${DB_PASSWORD:?Defina DB_PASSWORD}"
AWS_REGION="${AWS_REGION:-sa-east-1}"
RESTORE_INSTANCE="${RESTORE_INSTANCE:-blackbelt-restore-test}"
RESTORE_CLASS="${RESTORE_CLASS:-db.t3.medium}"
SKIP_CLEANUP="${SKIP_CLEANUP:-false}"
REPORT_FILE="${REPORT_FILE:-backup-restore-report.json}"
SNAPSHOT_ID="blackbelt-backup-test-$(date +%Y%m%d-%H%M%S)"

# ── Colors ──
R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; B='\033[0;34m'; NC='\033[0m'

# ── Report data ──
declare -A REPORT
REPORT[timestamp]=$(date -u +%Y-%m-%dT%H:%M:%SZ)
REPORT[source_instance]="$DB_INSTANCE"
REPORT[restore_instance]="$RESTORE_INSTANCE"
REPORT[region]="$AWS_REGION"
REPORT[verdict]="UNKNOWN"
ERRORS=()
WARNINGS=()

log()  { echo -e "${B}[$(date +%H:%M:%S)]${NC} $1"; }
ok()   { echo -e "${G}  ✓${NC} $1"; }
fail() { echo -e "${R}  ✗${NC} $1"; ERRORS+=("$1"); }
warn() { echo -e "${Y}  ⚠${NC} $1"; WARNINGS+=("$1"); }

cleanup() {
  if [[ "$SKIP_CLEANUP" != "true" ]]; then
    log "Limpando instância de teste..."
    aws rds delete-db-instance \
      --db-instance-identifier "$RESTORE_INSTANCE" \
      --skip-final-snapshot \
      --region "$AWS_REGION" 2>/dev/null && ok "Instância $RESTORE_INSTANCE deletada" || warn "Falha ao deletar instância de teste"
  else
    warn "SKIP_CLEANUP=true — instância $RESTORE_INSTANCE mantida"
  fi
}

trap cleanup EXIT

# ════════════════════════════════════════════════════════════
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║    BLACKBELT — Backup & Restore Validation            ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Source:   $DB_INSTANCE"
echo "║  Restore:  $RESTORE_INSTANCE"
echo "║  Region:   $AWS_REGION"
echo "║  Snapshot: $SNAPSHOT_ID"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ════════════════════════════════════════════════════════════
# FASE 1: VALIDAR CONFIGURAÇÃO DE BACKUP
# ════════════════════════════════════════════════════════════

log "FASE 1: Validando configuração de backup automático..."

INSTANCE_INFO=$(aws rds describe-db-instances \
  --db-instance-identifier "$DB_INSTANCE" \
  --region "$AWS_REGION" \
  --query 'DBInstances[0]' \
  --output json 2>&1) || { fail "Instância $DB_INSTANCE não encontrada"; exit 1; }

# Backup automático
BACKUP_RETENTION=$(echo "$INSTANCE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('BackupRetentionPeriod', 0))")
if [[ "$BACKUP_RETENTION" -ge 7 ]]; then
  ok "Backup automático: retenção ${BACKUP_RETENTION} dias"
  REPORT[backup_retention_days]="$BACKUP_RETENTION"
else
  fail "Backup automático: retenção ${BACKUP_RETENTION} dias (mínimo: 7)"
  REPORT[backup_retention_days]="$BACKUP_RETENTION"
fi

# Janela de backup
BACKUP_WINDOW=$(echo "$INSTANCE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('PreferredBackupWindow', 'NOT SET'))")
if [[ "$BACKUP_WINDOW" != "NOT SET" ]]; then
  ok "Janela de backup: $BACKUP_WINDOW UTC"
  REPORT[backup_window]="$BACKUP_WINDOW"
else
  fail "Janela de backup não configurada"
fi

# Criptografia
STORAGE_ENCRYPTED=$(echo "$INSTANCE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('StorageEncrypted', False))")
if [[ "$STORAGE_ENCRYPTED" == "True" ]]; then
  ok "Storage encryption: ativo (AES-256)"
  REPORT[storage_encrypted]="true"
else
  warn "Storage encryption: inativo (recomendado para LGPD)"
  REPORT[storage_encrypted]="false"
fi

# Multi-AZ
MULTI_AZ=$(echo "$INSTANCE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('MultiAZ', False))")
if [[ "$MULTI_AZ" == "True" ]]; then
  ok "Multi-AZ: ativo (failover automático)"
  REPORT[multi_az]="true"
else
  warn "Multi-AZ: inativo (recomendado para produção)"
  REPORT[multi_az]="false"
fi

# Snapshots existentes
SNAPSHOT_COUNT=$(aws rds describe-db-snapshots \
  --db-instance-identifier "$DB_INSTANCE" \
  --region "$AWS_REGION" \
  --query 'length(DBSnapshots)' \
  --output text 2>/dev/null || echo "0")
ok "Snapshots existentes: $SNAPSHOT_COUNT"
REPORT[existing_snapshots]="$SNAPSHOT_COUNT"

# PITR (Point-in-Time Recovery)
LATEST_RESTORABLE=$(echo "$INSTANCE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('LatestRestorableTime', 'N/A'))")
if [[ "$LATEST_RESTORABLE" != "N/A" ]]; then
  ok "PITR disponível até: $LATEST_RESTORABLE"
  REPORT[pitr_latest]="$LATEST_RESTORABLE"
else
  fail "PITR não disponível"
fi

# ════════════════════════════════════════════════════════════
# FASE 2: CAPTURAR BASELINE DO BANCO ORIGINAL
# ════════════════════════════════════════════════════════════

log ""
log "FASE 2: Capturando baseline do banco original..."

SOURCE_ENDPOINT=$(echo "$INSTANCE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['Endpoint']['Address'])")
SOURCE_PORT=$(echo "$INSTANCE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['Endpoint']['Port'])")

BASELINE_SQL=$(cat <<'EOSQL'
SELECT json_build_object(
  'timestamp', now(),
  'tables', (
    SELECT json_agg(json_build_object(
      'table', t.tablename,
      'row_count', (xpath('/row/cnt/text()',
        query_to_xml(format('SELECT count(*) AS cnt FROM %I.%I', t.schemaname, t.tablename), false, true, ''))
      )[1]::text::bigint
    ))
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename NOT LIKE '_prisma_%'
  ),
  'rls_tables', (
    SELECT count(*) FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public' AND c.relrowsecurity = true
  ),
  'total_size_mb', (
    SELECT round(pg_database_size(current_database()) / 1048576.0, 2)
  ),
  'extensions', (
    SELECT json_agg(extname) FROM pg_extension WHERE extname != 'plpgsql'
  ),
  'checksum', md5(
    (SELECT string_agg(t.tablename || ':' ||
      (xpath('/row/cnt/text()',
        query_to_xml(format('SELECT count(*) AS cnt FROM %I.%I', t.schemaname, t.tablename), false, true, ''))
      )[1]::text, ',' ORDER BY t.tablename)
    FROM pg_tables t WHERE t.schemaname = 'public' AND t.tablename NOT LIKE 'pg_%')
  )
);
EOSQL
)

BASELINE=$(PGPASSWORD="$DB_PASSWORD" psql \
  -h "$SOURCE_ENDPOINT" -p "$SOURCE_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -t -A -c "$BASELINE_SQL" 2>&1) || { fail "Falha ao capturar baseline: $BASELINE"; exit 1; }

ok "Baseline capturada"
BASELINE_CHECKSUM=$(echo "$BASELINE" | python3 -c "import sys,json; print(json.load(sys.stdin)['checksum'])")
BASELINE_SIZE=$(echo "$BASELINE" | python3 -c "import sys,json; print(json.load(sys.stdin)['total_size_mb'])")
BASELINE_RLS=$(echo "$BASELINE" | python3 -c "import sys,json; print(json.load(sys.stdin)['rls_tables'])")
ok "  Tamanho: ${BASELINE_SIZE} MB"
ok "  Checksum: ${BASELINE_CHECKSUM}"
ok "  Tabelas com RLS: ${BASELINE_RLS}"

REPORT[baseline_size_mb]="$BASELINE_SIZE"
REPORT[baseline_checksum]="$BASELINE_CHECKSUM"
REPORT[baseline_rls_tables]="$BASELINE_RLS"

# ════════════════════════════════════════════════════════════
# FASE 3: CRIAR SNAPSHOT MANUAL
# ════════════════════════════════════════════════════════════

log ""
log "FASE 3: Criando snapshot manual..."

SNAPSHOT_START=$(date +%s)

aws rds create-db-snapshot \
  --db-instance-identifier "$DB_INSTANCE" \
  --db-snapshot-identifier "$SNAPSHOT_ID" \
  --region "$AWS_REGION" \
  --output text > /dev/null 2>&1 || { fail "Falha ao criar snapshot"; exit 1; }

log "  Aguardando snapshot ficar disponível..."
aws rds wait db-snapshot-available \
  --db-snapshot-identifier "$SNAPSHOT_ID" \
  --region "$AWS_REGION" 2>&1 || { fail "Timeout aguardando snapshot"; exit 1; }

SNAPSHOT_END=$(date +%s)
SNAPSHOT_DURATION=$((SNAPSHOT_END - SNAPSHOT_START))

ok "Snapshot criado: $SNAPSHOT_ID (${SNAPSHOT_DURATION}s)"
REPORT[snapshot_id]="$SNAPSHOT_ID"
REPORT[snapshot_duration_sec]="$SNAPSHOT_DURATION"

# ════════════════════════════════════════════════════════════
# FASE 4: RESTAURAR EM INSTÂNCIA ISOLADA
# ════════════════════════════════════════════════════════════

log ""
log "FASE 4: Restaurando snapshot em instância isolada..."

RESTORE_START=$(date +%s)

# Deletar instância anterior se existir
aws rds delete-db-instance \
  --db-instance-identifier "$RESTORE_INSTANCE" \
  --skip-final-snapshot \
  --region "$AWS_REGION" 2>/dev/null && {
    log "  Instância anterior encontrada, aguardando deleção..."
    aws rds wait db-instance-deleted \
      --db-instance-identifier "$RESTORE_INSTANCE" \
      --region "$AWS_REGION" 2>/dev/null || true
  }

aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier "$RESTORE_INSTANCE" \
  --db-snapshot-identifier "$SNAPSHOT_ID" \
  --db-instance-class "$RESTORE_CLASS" \
  --no-multi-az \
  --no-publicly-accessible \
  --region "$AWS_REGION" \
  --output text > /dev/null 2>&1 || { fail "Falha ao restaurar snapshot"; exit 1; }

log "  Aguardando instância restaurada ficar disponível..."
aws rds wait db-instance-available \
  --db-instance-identifier "$RESTORE_INSTANCE" \
  --region "$AWS_REGION" 2>&1 || { fail "Timeout aguardando restore"; exit 1; }

RESTORE_END=$(date +%s)
RESTORE_DURATION=$((RESTORE_END - RESTORE_START))
RTO_MINUTES=$(( (RESTORE_DURATION + 59) / 60 ))

ok "Instância restaurada: $RESTORE_INSTANCE (${RESTORE_DURATION}s = ~${RTO_MINUTES} min)"
REPORT[restore_duration_sec]="$RESTORE_DURATION"
REPORT[rto_minutes]="$RTO_MINUTES"

# ════════════════════════════════════════════════════════════
# FASE 5: VALIDAR INTEGRIDADE DOS DADOS
# ════════════════════════════════════════════════════════════

log ""
log "FASE 5: Validando integridade dos dados restaurados..."

RESTORE_INFO=$(aws rds describe-db-instances \
  --db-instance-identifier "$RESTORE_INSTANCE" \
  --region "$AWS_REGION" \
  --query 'DBInstances[0]' \
  --output json)

RESTORE_ENDPOINT=$(echo "$RESTORE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['Endpoint']['Address'])")
RESTORE_PORT=$(echo "$RESTORE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['Endpoint']['Port'])")

# Capturar mesmas métricas no banco restaurado
RESTORED=$(PGPASSWORD="$DB_PASSWORD" psql \
  -h "$RESTORE_ENDPOINT" -p "$RESTORE_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -t -A -c "$BASELINE_SQL" 2>&1) || { fail "Falha ao conectar no banco restaurado: $RESTORED"; }

RESTORED_CHECKSUM=$(echo "$RESTORED" | python3 -c "import sys,json; print(json.load(sys.stdin)['checksum'])")
RESTORED_SIZE=$(echo "$RESTORED" | python3 -c "import sys,json; print(json.load(sys.stdin)['total_size_mb'])")
RESTORED_RLS=$(echo "$RESTORED" | python3 -c "import sys,json; print(json.load(sys.stdin)['rls_tables'])")

REPORT[restored_size_mb]="$RESTORED_SIZE"
REPORT[restored_checksum]="$RESTORED_CHECKSUM"
REPORT[restored_rls_tables]="$RESTORED_RLS"

# 5.1 Checksum match
if [[ "$BASELINE_CHECKSUM" == "$RESTORED_CHECKSUM" ]]; then
  ok "Checksum: MATCH ($BASELINE_CHECKSUM)"
  REPORT[checksum_match]="true"
else
  fail "Checksum: MISMATCH (original=$BASELINE_CHECKSUM, restored=$RESTORED_CHECKSUM)"
  REPORT[checksum_match]="false"
fi

# 5.2 Size comparison
SIZE_DIFF=$(python3 -c "print(abs(float('$BASELINE_SIZE') - float('$RESTORED_SIZE')))")
if python3 -c "exit(0 if float('$SIZE_DIFF') < 1.0 else 1)"; then
  ok "Tamanho: ${RESTORED_SIZE} MB (diff: ${SIZE_DIFF} MB)"
else
  warn "Tamanho divergente: original=${BASELINE_SIZE}MB restored=${RESTORED_SIZE}MB (diff: ${SIZE_DIFF}MB)"
fi

# 5.3 RLS intact
if [[ "$BASELINE_RLS" == "$RESTORED_RLS" ]]; then
  ok "RLS tables: ${RESTORED_RLS} (preservado)"
  REPORT[rls_preserved]="true"
else
  fail "RLS tables: original=${BASELINE_RLS} restored=${RESTORED_RLS}"
  REPORT[rls_preserved]="false"
fi

# 5.4 Table-by-table row count
log "  Verificação tabela por tabela..."
TABLE_RESULTS=$(PGPASSWORD="$DB_PASSWORD" psql \
  -h "$RESTORE_ENDPOINT" -p "$RESTORE_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -t -A -c "
    SELECT json_agg(json_build_object('table', t.tablename, 'rows',
      (xpath('/row/cnt/text()',
        query_to_xml(format('SELECT count(*) AS cnt FROM %I.%I', t.schemaname, t.tablename), false, true, ''))
      )[1]::text::bigint))
    FROM pg_tables t WHERE t.schemaname = 'public' AND t.tablename NOT LIKE 'pg_%' AND t.tablename NOT LIKE '_prisma_%';
  " 2>/dev/null)

echo "$TABLE_RESULTS" | python3 -c "
import sys, json
tables = json.load(sys.stdin)
for t in sorted(tables, key=lambda x: x['table']):
    print(f\"    {t['table']:30s} {t['rows']:>8d} rows\")
" 2>/dev/null || warn "Não foi possível listar tabelas individualmente"

# 5.5 Extensions preserved
RESTORED_EXTENSIONS=$(PGPASSWORD="$DB_PASSWORD" psql \
  -h "$RESTORE_ENDPOINT" -p "$RESTORE_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -t -A -c "SELECT string_agg(extname, ', ' ORDER BY extname) FROM pg_extension WHERE extname != 'plpgsql';" 2>/dev/null)
ok "Extensions: $RESTORED_EXTENSIONS"
REPORT[restored_extensions]="$RESTORED_EXTENSIONS"

# 5.6 RLS validation test
RLS_TEST=$(PGPASSWORD="$DB_PASSWORD" psql \
  -h "$RESTORE_ENDPOINT" -p "$RESTORE_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -t -A -c "
    SELECT count(*) FROM pg_policies
    WHERE schemaname = 'public'
    AND policyname LIKE 'tenant_%';
  " 2>/dev/null || echo "0")
if [[ "$RLS_TEST" -ge 20 ]]; then
  ok "RLS policies: ${RLS_TEST} tenant policies preservadas"
  REPORT[rls_policies_count]="$RLS_TEST"
else
  warn "RLS policies: ${RLS_TEST} (esperado ≥20)"
  REPORT[rls_policies_count]="$RLS_TEST"
fi

# 5.7 Hardening settings preserved
HARDENING_TEST=$(PGPASSWORD="$DB_PASSWORD" psql \
  -h "$RESTORE_ENDPOINT" -p "$RESTORE_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -t -A -c "SHOW statement_timeout;" 2>/dev/null || echo "0")
if [[ "$HARDENING_TEST" != "0" && "$HARDENING_TEST" != "" ]]; then
  ok "statement_timeout: $HARDENING_TEST (preservado)"
else
  warn "statement_timeout: reset to default (requer reconfiguração pós-restore)"
fi

# ════════════════════════════════════════════════════════════
# FASE 6: CALCULAR RPO
# ════════════════════════════════════════════════════════════

log ""
log "FASE 6: Calculando RPO..."

# RPO = tempo entre último backup automático e agora
if [[ "$LATEST_RESTORABLE" != "N/A" ]]; then
  # Com PITR, RPO é ~5 minutos (intervalo de WAL archiving)
  RPO_MINUTES=5
  ok "RPO com PITR: ~${RPO_MINUTES} minutos (WAL archiving contínuo)"
else
  # Sem PITR, RPO é o intervalo entre snapshots automáticos (24h)
  RPO_MINUTES=1440
  warn "RPO sem PITR: ~${RPO_MINUTES} minutos (24h entre snapshots)"
fi
REPORT[rpo_minutes]="$RPO_MINUTES"

# ════════════════════════════════════════════════════════════
# FASE 7: GERAR RELATÓRIO
# ════════════════════════════════════════════════════════════

log ""
log "FASE 7: Gerando relatório..."

# Determine verdict
if [[ ${#ERRORS[@]} -eq 0 ]]; then
  REPORT[verdict]="APROVADO"
  VERDICT_COLOR="$G"
elif [[ ${#ERRORS[@]} -le 2 ]]; then
  REPORT[verdict]="APROVADO COM RESSALVAS"
  VERDICT_COLOR="$Y"
else
  REPORT[verdict]="REPROVADO"
  VERDICT_COLOR="$R"
fi

# JSON report
cat > "$REPORT_FILE" <<EOF
{
  "test": "Backup & Restore Validation",
  "version": "1.0",
  "timestamp": "${REPORT[timestamp]}",
  "verdict": "${REPORT[verdict]}",
  "environment": {
    "source_instance": "${REPORT[source_instance]}",
    "restore_instance": "${REPORT[restore_instance]}",
    "region": "${REPORT[region]}",
    "snapshot_id": "${REPORT[snapshot_id]}"
  },
  "backup_config": {
    "retention_days": ${REPORT[backup_retention_days]},
    "backup_window": "${REPORT[backup_window]}",
    "storage_encrypted": ${REPORT[storage_encrypted]},
    "multi_az": ${REPORT[multi_az]},
    "existing_snapshots": ${REPORT[existing_snapshots]},
    "pitr_latest": "${REPORT[pitr_latest]:-N/A}"
  },
  "metrics": {
    "snapshot_duration_sec": ${REPORT[snapshot_duration_sec]},
    "restore_duration_sec": ${REPORT[restore_duration_sec]},
    "rto_minutes": ${REPORT[rto_minutes]},
    "rpo_minutes": ${REPORT[rpo_minutes]}
  },
  "integrity": {
    "baseline_size_mb": ${REPORT[baseline_size_mb]},
    "restored_size_mb": ${REPORT[restored_size_mb]},
    "checksum_match": ${REPORT[checksum_match]},
    "rls_preserved": ${REPORT[rls_preserved]},
    "rls_policies_count": ${REPORT[rls_policies_count]},
    "baseline_rls_tables": ${REPORT[baseline_rls_tables]},
    "restored_rls_tables": ${REPORT[restored_rls_tables]}
  },
  "errors": [$(printf '"%s",' "${ERRORS[@]}" | sed 's/,$//')],
  "warnings": [$(printf '"%s",' "${WARNINGS[@]}" | sed 's/,$//')]
}
EOF

# ════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              RESULTADO DO TESTE                         ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo -e "║  Veredito:    ${VERDICT_COLOR}${REPORT[verdict]}${NC}"
echo "║"
echo "║  Snapshot:     ${REPORT[snapshot_duration_sec]}s"
echo "║  Restore:      ${REPORT[restore_duration_sec]}s (~${REPORT[rto_minutes]} min)"
echo "║  RTO:          ${REPORT[rto_minutes]} minutos"
echo "║  RPO:          ${REPORT[rpo_minutes]} minutos"
echo "║"
echo "║  Checksum:     ${REPORT[checksum_match]}"
echo "║  RLS:          ${REPORT[rls_preserved]} (${REPORT[rls_policies_count]} policies)"
echo "║  Size:         ${REPORT[baseline_size_mb]}MB → ${REPORT[restored_size_mb]}MB"
echo "║"
echo "║  Errors:       ${#ERRORS[@]}"
echo "║  Warnings:     ${#WARNINGS[@]}"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📄 Relatório: $REPORT_FILE"

# Exit code
if [[ "${REPORT[verdict]}" == "REPROVADO" ]]; then
  exit 1
else
  exit 0
fi
