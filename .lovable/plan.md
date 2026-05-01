# Acesso Restrito ao Painel Admin

Restringir totalmente o acesso ao painel `/admin` apenas ao e-mail `justafiliado@proton.me`, com fluxo de primeiro acesso para criar a senha.

## 1. Auth do Supabase — auto-confirmar e-mail

Configurar `auto_confirm` para signups por e-mail (equivalente a desativar "Confirm email"). Isso permite login imediato após o primeiro cadastro, sem clicar em link de confirmação. Vou usar a ferramenta `configure_auth` do Cloud para aplicar essa mudança.

## 2. Constante do e-mail autorizado

Criar `src/lib/admin.ts` exportando:
```ts
export const ADMIN_EMAIL = "justafiliado@proton.me";
```
Para reuso em login e dashboard.

## 3. Tela de login (`src/pages/AdminLogin.tsx`) — reescrita

Comportamento novo:

- **Detectar primeiro acesso**: ao montar, chamar uma Edge Function `admin-status` (sem JWT, pública) que, usando `service_role`, verifica se já existe usuário com `email = justafiliado@proton.me` em `auth.users`. Retorna `{ exists: boolean }`.
  - Necessário porque o cliente não tem permissão para consultar `auth.users` diretamente.
- **Se `exists === false`** → renderizar formulário **"Criar senha"**:
  - Campos: `Senha`, `Confirmar senha`, botão **"CRIAR SENHA E ENTRAR"**.
  - Validação inline: se diferentes, mostrar `As senhas não coincidem` em vermelho abaixo do campo (sem toast).
  - Mínimo 6 caracteres.
  - Ao submeter: `supabase.auth.signUp({ email: ADMIN_EMAIL, password })`. Como o e-mail está auto-confirmado, na sequência fazer `signInWithPassword` para garantir sessão e redirecionar para `/admin`.
- **Se `exists === true`** → formulário **"Login"** normal:
  - Campos: `E-mail`, `Senha`, botão **"ENTRAR"**.
  - `signInWithPassword`.
- **Bloqueio de domínio**: antes de qualquer chamada de signin, comparar o email digitado (lowercase, trim) com `ADMIN_EMAIL`. Se diferente, exibir erro inline `Acesso não autorizado.` e não chamar a API.
- **Remover** o link "Não tem conta? Criar uma" e todo o estado `mode === "signup"`.
- **Remover** o bloco que mostra o SQL para tornar admin (não faz mais sentido — ver item 5).

## 4. Edge Function `admin-status`

Nova função em `supabase/functions/admin-status/index.ts`:

- Pública (`verify_jwt = false` em `supabase/config.toml`).
- Usa `SUPABASE_SERVICE_ROLE_KEY` para listar usuários via `supabase.auth.admin.listUsers()` ou query direta na tabela.
- Retorna `{ exists: boolean }` indicando se `justafiliado@proton.me` já está cadastrado.
- CORS liberado.

## 5. Dashboard (`src/pages/AdminDashboard.tsx`) — guarda extra

No `useEffect` de auth, adicionar verificação:
```ts
if (session && session.user.email?.toLowerCase() !== ADMIN_EMAIL) {
  await supabase.auth.signOut();
  toast.error("Acesso não autorizado.");
  navigate("/admin/login", { replace: true });
  return;
}
```
Aplicar a mesma checagem no `AdminLogin` após qualquer login bem-sucedido.

## 6. Auto-promoção a admin (migration)

Para que o primeiro signup do e-mail autorizado já tenha a role `admin` sem rodar SQL manual, criar trigger em `auth.users` (após insert) que:

- Se `NEW.email = 'justafiliado@proton.me'`, insere `(NEW.id, 'admin')` em `public.user_roles` (com `ON CONFLICT DO NOTHING`).

Função `SECURITY DEFINER`, `search_path = public`. Trigger `AFTER INSERT ON auth.users`.

Isso é a única forma de mexer com `auth.users` que é permitida (trigger criado por nós, não modifica nada em `auth.*`, só lê `NEW`).

## Detalhes técnicos

- Arquivos editados: `src/pages/AdminLogin.tsx`, `src/pages/AdminDashboard.tsx`.
- Arquivos criados: `src/lib/admin.ts`, `supabase/functions/admin-status/index.ts`, bloco em `supabase/config.toml` para `verify_jwt = false`, migration SQL com trigger.
- Configuração do auth: `auto_confirm = true` para email signups via `configure_auth`.
- O `useAuth` continua igual; a checagem de e-mail é feita explicitamente nas duas páginas para garantir defesa em profundidade.

Posso seguir?
