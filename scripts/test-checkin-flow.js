#!/usr/bin/env node
/**
 * Script de teste do fluxo de Check-in
 * Verifica se os dados mock estão sendo carregados corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('Teste do Fluxo de Check-in - Blackbelt');
console.log('==========================================\n');

// 1. Verificar .env.local
console.log('1️⃣ Verificando .env.local...');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasMock = envContent.includes('NEXT_PUBLIC_USE_MOCK=true');
  console.log(hasMock ? '   ✅ NEXT_PUBLIC_USE_MOCK=true' : '   ❌ NEXT_PUBLIC_USE_MOCK não configurado');
} else {
  console.log('   ❌ .env.local não encontrado');
}

// 2. Verificar arquivos mock
console.log('\n2️⃣ Verificando arquivos de mock...');
const mockFiles = [
  'lib/__mocks__/admin.mock.ts',
  'lib/__mocks__/checkin.mock.ts'
];
mockFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  console.log(fs.existsSync(filePath) ? `   ✅ ${file}` : `   ❌ ${file}`);
});

// 3. Contar dados mock
console.log('\n3️⃣ Verificando dados mock...');
try {
  const adminMock = fs.readFileSync(path.join(__dirname, '..', 'lib/__mocks__/admin.mock.ts'), 'utf-8');
  
  // Contar usuários
  const usuariosMatch = adminMock.match(/export const usuarios: Usuario\[\] = \[/);
  console.log(usuariosMatch ? '   ✅ Array usuarios encontrado' : '   ❌ Array usuarios não encontrado');
  
  // Contar turmas
  const turmasMatch = adminMock.match(/export const turmas: Turma\[\] = \[/);
  console.log(turmasMatch ? '   ✅ Array turmas encontrado' : '   ❌ Array turmas não encontrado');
  
  // Contar check-ins
  const checkInsMatch = adminMock.match(/export const checkIns: CheckIn\[\] = \[/);
  console.log(checkInsMatch ? '   ✅ Array checkIns encontrado' : '   ❌ Array checkIns não encontrado');
} catch (err) {
  console.log('   ❌ Erro ao ler arquivo:', err.message);
}

// 4. Verificar serviços
console.log('\n4️⃣ Verificando serviços...');
const services = [
  'lib/api/admin.service.ts',
  'lib/api/checkin.service.ts',
  'lib/env.ts'
];
services.forEach(service => {
  const filePath = path.join(__dirname, '..', service);
  console.log(fs.existsSync(filePath) ? `   ✅ ${service}` : `   ❌ ${service}`);
});

// 5. Verificar página de check-in
console.log('\n5️⃣ Verificando página de check-in...');
const checkinPage = path.join(__dirname, '..', 'app/(admin)/check-in/page.tsx');
console.log(fs.existsSync(checkinPage) ? '   ✅ app/(admin)/check-in/page.tsx' : '   ❌ Página não encontrada');

// 6. Instruções finais
console.log('\n==========================================');
console.log('Próximos passos:');
console.log('==========================================');
console.log('');
console.log('1. 🛑 Pare o servidor (se estiver rodando)');
console.log('   Ctrl+C no terminal');
console.log('');
console.log('2. 🚀 Inicie o servidor:');
console.log('   pnpm dev');
console.log('');
console.log('3. 🌐 Acesse:');
console.log('   http://localhost:3000/check-in');
console.log('');
console.log('4. ✅ Verifique:');
console.log('   - Loading states aparecem durante o carregamento');
console.log('   - Estatísticas são exibidas (check-ins, alunos, taxa)');
console.log('   - Busca de alunos funciona');
console.log('   - Registro de check-in opera corretamente');
console.log('');
console.log('==========================================');
