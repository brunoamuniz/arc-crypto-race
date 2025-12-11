# 📋 Configuração do Supabase - ARC CRYPTO RACE

## 🔑 Informações Necessárias do Supabase

Para testar o backend, você precisa criar um projeto no Supabase e fornecer as seguintes informações:

### 1. Criar Projeto Supabase

1. Acesse: https://supabase.com
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Project Name:** `arc-crypto-bros` (ou qualquer nome)
   - **Database Password:** (anote esta senha)
   - **Region:** Escolha a mais próxima
5. Aguarde o projeto ser criado (~2 minutos)

### 2. Obter Credenciais

Após criar o projeto, você encontrará as credenciais em:

**Settings → API**

Você precisa de:

1. **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - Formato: `https://xxxxxxxxxxxxx.supabase.co`
   - Exemplo: `https://abcdefghijklmnop.supabase.co`

2. **anon public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Chave pública (pode ser exposta no frontend)
   - Formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **service_role key** (SUPABASE_SERVICE_ROLE_KEY)
   - ⚠️ **SECRETO** - Nunca exponha no frontend!
   - Formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Usado apenas no backend para operações admin

### 3. Executar Schema SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo de `docs/SUPABASE_SCHEMA.sql`
4. Clique em **Run** (ou Ctrl+Enter)
5. Verifique se todas as tabelas foram criadas:
   - `scores`
   - `best_scores`
   - `pending_commits`
   - `commit_logs`

### 4. Verificar Tabelas

Vá em **Table Editor** e verifique se as 4 tabelas aparecem:
- ✅ scores
- ✅ best_scores
- ✅ pending_commits
- ✅ commit_logs

## 📝 Preencher .env

Após obter as credenciais, adicione ao `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ Checklist

- [ ] Projeto Supabase criado
- [ ] Credenciais obtidas (URL, anon key, service role key)
- [ ] Schema SQL executado
- [ ] Tabelas verificadas
- [ ] `.env` preenchido com as credenciais

## 🔒 Segurança

- ✅ **anon key** - Pode ser exposta (usada no frontend)
- ⚠️ **service_role key** - SECRETO! Apenas no servidor
- ⚠️ **PRIVATE_KEY** - SECRETO! Apenas no servidor

Nunca commite o `.env` no git!

