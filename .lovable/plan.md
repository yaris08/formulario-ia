## Formulário "Foto Ultra-Realista com o Mito" + Painel Admin

Vou recriar fielmente o formulário enviado (mantendo o visual escuro com dourado e as fontes Cormorant Garamond + DM Sans), porém usando os componentes do projeto (shadcn) para inputs, selects e botões. Os pedidos serão salvos no Lovable Cloud, e você terá um painel admin protegido por login para visualizá-los.

### Página pública: `/` (formulário)

Reproduz o layout do HTML enviado:

- **Header**: ícone circular dourado, título "Foto **Ultra-Realista** com o Mito" (palavra em dourado), subtítulo "Tecnologia de IA — Resultado em até 24h".
- **Trust bar**: "+ de 749 fotos entregues", "Privacidade garantida", "Pague só após aprovar".
- **Seção "Seus dados"**: Nome completo, WhatsApp (com máscara `(00) 00000-0000`), Estado (UF dropdown).
- **Seção "Seu pedido"**:
  - Personalidade (agrupada em "Política" e "Artistas / Cantores", com opção "Outro" que revela um campo de texto).
  - Quantidade de fotos (1 — R$ 8,90 / 2 — R$ 15,00 / 3 — R$ 20,00 / 4+ — combinar).
  - Tipo de cenário (Abraçados, Pose formal, Ao ar livre, Evento/Palco, Sem preferência).
  - Observações (textarea, contador 0/400).
- **Seção "Sua selfie"**: zona de upload com drag-and-drop, preview da imagem, aceita JPG/PNG/WEBP até 10MB. 4 dicas de qualidade.
- **Caixa de preço**: atualiza dinamicamente conforme a quantidade escolhida. Texto: "Pagamento via Pix somente após você aprovar a foto".
- **Botão dourado** "Enviar Pedido" com spinner durante envio.
- **Disclaimer** sobre uso das fotos e LGPD.
- **Tela de sucesso** após envio: ícone check verde + "Pedido recebido! Em breve entraremos em contato pelo seu WhatsApp."

Validação com zod no submit (nome, whatsapp, estado, personalidade, quantidade obrigatórios; selfie obrigatória).

### Backend (Lovable Cloud)

**Tabela `pedidos`**:
- `id`, `created_at`
- `nome`, `whatsapp`, `estado`
- `personalidade`, `quantidade`, `cenario`, `observacoes`
- `selfie_url` (caminho no storage)
- `valor` (texto: "8,90", "15,00", etc.)
- `status` (`novo` | `em_producao` | `aprovado` | `pago` | `cancelado`) — default `novo`

**Storage bucket `selfies`** (privado): cada selfie é salva com nome único; o admin acessa via signed URL.

**RLS**:
- `INSERT` no `pedidos`: público (anônimo pode criar pedido).
- `SELECT/UPDATE` no `pedidos`: apenas usuários com role `admin`.
- Bucket `selfies`: upload público, leitura apenas para `admin`.

**Tabela de roles** (`user_roles` + enum `app_role` + função `has_role`) seguindo o padrão seguro de roles separadas.

### Painel admin: `/admin`

- Rota `/admin/login`: tela de login (email + senha) com o mesmo visual escuro/dourado.
- Rota `/admin` (protegida, requer role `admin`):
  - Lista de pedidos em cards/tabela, ordenada do mais recente.
  - Cada pedido mostra: nome, whatsapp (clicável → abre WhatsApp), estado, personalidade, quantidade, cenário, observações, valor, data, status.
  - Thumbnail da selfie (clicável para abrir em tamanho grande via signed URL).
  - Dropdown para mudar o status do pedido.
  - Filtros por status no topo.
  - Contador de pedidos novos.
- Botão de logout.

**Criação do primeiro admin**: após você criar sua conta em `/admin/login`, eu te explico como rodar uma query rápida (1 linha) para te marcar como admin. (Não dá pra hardcodar porque o user_id só existe após o cadastro.)

### Detalhes técnicos

- Toda a validação client-side com `zod` + `react-hook-form`.
- Máscara do WhatsApp aplicada inline (sem lib extra).
- Upload da selfie direto para o bucket via supabase-js (com tamanho/MIME validados antes).
- Após o `INSERT` do pedido, mostra a tela de sucesso e bloqueia novo envio na mesma sessão.
- Fontes Google (Cormorant Garamond + DM Sans) carregadas no `index.html`.
- Cores adicionadas como tokens semânticos no `index.css` e `tailwind.config.ts` (gold, dark surfaces) — nada de cores hardcoded nos componentes.
- Toaster (sonner) para mensagens de erro de envio.

### Arquivos principais a criar/editar

```text
src/pages/Index.tsx                    formulário público
src/pages/admin/Login.tsx              login do admin
src/pages/admin/Dashboard.tsx          lista de pedidos
src/components/order-form/...          seções do formulário
src/components/SelfieUpload.tsx        upload com drag&drop + preview
src/hooks/useAuth.ts                   sessão + role admin
src/lib/validation.ts                  schemas zod
src/integrations/supabase/...          client + types (auto)
src/App.tsx                            rotas /admin/login e /admin
src/index.css + tailwind.config.ts     tokens gold/dark + fontes
index.html                             preconnect + Google Fonts
migration                              tabelas, RLS, bucket, roles
```

### Fora do escopo (posso adicionar depois se quiser)

- Pagamento via Pix integrado (hoje fica manual, como no original).
- Notificação por e-mail/Telegram quando chega novo pedido.
- Edição/exclusão de pedidos pelo admin (por ora, só mudança de status).
