-- ============================================================
-- Migration: Tabela usuarios_academia para controle de acesso
-- Description: Associação entre usuários e academias com perfis
-- ============================================================

-- Criar tipo enum para perfis se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'perfil_usuario') THEN
        CREATE TYPE perfil_usuario AS ENUM (
            'ALUNO', 
            'PROFESSOR', 
            'RECEPCAO', 
            'ADMINISTRADOR', 
            'OWNER', 
            'SUPER_ADMIN'
        );
    END IF;
END$$;

-- Tabela de associação usuário-academia
CREATE TABLE IF NOT EXISTS usuarios_academia (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    academia_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    perfil perfil_usuario NOT NULL DEFAULT 'ALUNO',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    UNIQUE(usuario_id, academia_id)
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuarios_academia_updated_at
    BEFORE UPDATE ON usuarios_academia
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_academia_usuario ON usuarios_academia(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_academia_academia ON usuarios_academia(academia_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_academia_perfil ON usuarios_academia(perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_academia_active ON usuarios_academia(is_active);

-- RLS
ALTER TABLE usuarios_academia ENABLE ROW LEVEL SECURITY;

-- Política: usuário vê suas próprias associações
CREATE POLICY usuarios_academia_select_own ON usuarios_academia
    FOR SELECT TO authenticated
    USING (usuario_id = auth.uid());

-- Política: usuário pode inserir/atualizar apenas suas próprias associações (se for owner/admin)
CREATE POLICY usuarios_academia_insert_own ON usuarios_academia
    FOR INSERT TO authenticated
    WITH CHECK (
        usuario_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM usuarios_academia ua
            WHERE ua.usuario_id = auth.uid()
            AND ua.academia_id = usuarios_academia.academia_id
            AND ua.perfil IN ('ADMINISTRADOR', 'OWNER', 'SUPER_ADMIN')
        )
    );

-- Política: super_admin pode tudo
CREATE POLICY usuarios_academia_super_admin ON usuarios_academia
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua
            WHERE ua.usuario_id = auth.uid()
            AND ua.perfil = 'SUPER_ADMIN'
        )
    );

-- Criar super_admin inicial (deve ser atualizado manualmente com o user_id correto)
-- INSERT INTO usuarios_academia (usuario_id, academia_id, perfil)
-- SELECT 
--     'seu-user-id-aqui'::uuid,
--     (SELECT id FROM academias LIMIT 1),
--     'SUPER_ADMIN'
-- ON CONFLICT DO NOTHING;
