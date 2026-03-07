CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    comentario TEXT NOT NULL CHECK (LENGTH(comentario) <= 500),
    nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
    perfil VARCHAR(50) DEFAULT 'aluno' CHECK (perfil IN ('aluno', 'professor', 'responsavel', 'admin')),
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    data DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_data ON testimonials(data DESC);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Depoimentos aprovados visiveis para todos" 
    ON testimonials FOR SELECT 
    USING (status = 'aprovado');

CREATE POLICY "Usuarios autenticados podem criar" 
    ON testimonials FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
