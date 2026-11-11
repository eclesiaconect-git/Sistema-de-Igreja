# Sistema da Igreja

Site público (horários, atividades, pedido de oração, dízimo via PIX) + painel
interno com login (membros, dízimos, escalas), 100% gratuito para começar
(Vercel + Supabase, planos free).

---

## Passo 1 — Criar o banco de dados (Supabase)

1. Acesse **https://supabase.com** e crie uma conta grátis.
2. Clique em **New project**. Escolha um nome e uma senha para o banco (guarde
   essa senha, mas ela não será usada no app).
3. Espere o projeto ser criado (leva ~2 minutos).
4. No menu lateral, vá em **SQL Editor** → **New query**.
5. Abra o arquivo `supabase/schema.sql` (está nesta pasta), copie **tudo** e
   cole no editor. Clique em **Run**.
   - Isso cria todas as tabelas (membros, dízimos, escalas, atividades,
     pedidos de oração, configurações) e já configura a segurança.
   - **Já rodou o schema antes e agora só quer adicionar as configurações
     editáveis?** Rode só o arquivo `supabase/migration_configuracoes.sql`
     em vez do `schema.sql` completo.
6. Vá em **Project Settings → API**. Copie:
   - **Project URL**
   - **anon public key**
   - Você vai usar os dois no Passo 3.

### Criar os primeiros usuários da equipe (login)

1. No menu lateral, vá em **Authentication → Users → Add user**.
2. Crie um usuário com e-mail e senha para cada pessoa da equipe (admin,
   tesouraria, líderes). Marque **Auto Confirm User** para não precisar
   confirmar e-mail.
3. Pronto — essas pessoas já conseguem entrar em `/login` no site.

---

## Passo 2 — Testar localmente (opcional, mas recomendado)

Se quiser ver funcionando no seu computador antes de publicar:

```bash
npm install
cp .env.example .env.local
```

Abra `.env.local` e preencha com os dados do Supabase (Passo 1) e os dados da
igreja (nome, chave PIX). Depois:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

---

## Passo 3 — Publicar de graça (Vercel)

1. Crie uma conta em **https://vercel.com** (pode entrar com GitHub).
2. Suba este projeto para um repositório no GitHub:
   - Crie um repositório novo em github.com/new
   - No terminal, dentro desta pasta:
     ```bash
     git init
     git add .
     git commit -m "Sistema da igreja"
     git branch -M main
     git remote add origin SEU_LINK_DO_REPOSITORIO
     git push -u origin main
     ```
3. Na Vercel, clique em **Add New → Project** e selecione o repositório.
4. Em **Environment Variables**, adicione as mesmas variáveis do arquivo
   `.env.example`, com os valores reais:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (o nome da igreja e os dados do PIX você configura depois, direto no
     site, em Painel → Configurações — não precisa adicionar aqui)
5. Clique em **Deploy**. Em 1-2 minutos o site está no ar, com um link tipo
   `seu-projeto.vercel.app` (dá pra configurar um domínio próprio depois,
   nas configurações do projeto na Vercel).

---

## Como usar no dia a dia

- **Site público**: qualquer pessoa acessa o link, vê horários/atividades,
  envia pedido de oração e faz PIX.
- **`/login`**: a equipe entra com o e-mail/senha criado no Supabase.
- **`/painel`**: depois de logado, a equipe cadastra membros, lança
  dízimos, monta escalas, cadastra atividades (que aparecem automaticamente
  no site público), vê os pedidos de oração recebidos e edita o nome da
  igreja e os dados do PIX em **Configurações** — tudo direto pelo
  navegador, sem precisar mexer na Vercel ou no código.
- **Adicionar/remover pessoas da equipe**: sempre pelo Supabase em
  Authentication → Users. Não precisa mexer no código.

## Sobre a chave PIX

O QR Code e o código "copia e cola" são gerados automaticamente a partir da
chave PIX que você colocar em `NEXT_PUBLIC_PIX_CHAVE` — não depende de
nenhum banco ou aprovação de conta comercial. Funciona com qualquer chave
(e-mail, telefone, CPF/CNPJ ou aleatória) cadastrada no aplicativo do banco
da igreja.

## Limites do plano gratuito

- **Supabase free**: até 500MB de banco e 50 mil usuários autenticados —
  mais do que suficiente para uma igreja de até algumas centenas de membros.
- **Vercel free**: tráfego generoso para sites institucionais/pequenos, sem
  cartão de crédito exigido.
- Se a igreja crescer muito, dá pra migrar para planos pagos sem precisar
  reescrever o sistema.
