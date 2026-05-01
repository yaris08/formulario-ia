# Plano de ajustes

A maior parte do que você pediu **já está implementado** neste projeto. Vou listar o que existe e depois o que realmente precisa ser feito.

## Já está pronto (não precisa mexer)

- Backend conectado (Lovable Cloud) com tabela `pedidos` e bucket `selfies`
- Autenticação por e-mail/senha + sistema de roles (`user_roles` + `has_role`)
- RLS: qualquer um cria pedido; só admin lê/edita/exclui
- Formulário salva no banco + faz upload da selfie + tela de sucesso
- Painel `/admin` lista pedidos com card (nome, WhatsApp clicável, personalidade, quantidade, cenário, observações, thumbnail clicável da selfie, data relativa, badge/select de status)
- Filtros por status + ordenação por mais recente
- Alteração de status pelo dropdown

## O que falta (3 ajustes)

### 1. Separar `outra_pessoa` em campo próprio

Hoje, quando o usuário digita um nome no campo "Outra pessoa", ele sobrescreve `personalidade = "outro"` e o nome vai para `personalidade_outro` no submit, sendo concatenado em `personalidade` no banco. Você pediu uma coluna separada `outra_pessoa`.

- Migração: adicionar coluna `outra_pessoa text` (nullable) em `pedidos`
- `Index.tsx`: enviar `personalidade` (valor cru do select) e `outra_pessoa` (texto livre) separadamente, sem mais a lógica de "se outro, sobrescreve"
- `AdminDashboard.tsx`: exibir "Outra pessoa: …" no card quando preenchido

Observação: a coluna `valor` no banco continua sendo string formatada ("8,90"). A coluna `estado` existe mas o formulário atual não coleta — fica nullable e em branco, sem problema.

### 2. Botão de excluir pedido no admin

Adicionar um botão "Excluir" em cada card (com `AlertDialog` de confirmação) que chama `supabase.from("pedidos").delete().eq("id", id)` e também remove a selfie do storage (`supabase.storage.from("selfies").remove([selfie_path])`). Já existe a policy "Admins can delete orders".

### 3. PWA instalável (somente manifest, sem service worker)

**Importante:** a documentação interna do Lovable recomenda fortemente **não** adicionar service worker em projetos rodados no preview iframe (causa cache obsoleto e quebra de roteamento). Como você só precisa que o painel possa ser **instalado na tela inicial** (Add to Home Screen), basta um `manifest.json` — sem service worker, sem `vite-plugin-pwa`. Isso cobre 100% da instalabilidade no Android e iOS.

A parte de "funcionamento offline" do seu pedido seria o único motivo para um service worker, mas para um painel admin que precisa buscar dados em tempo real do backend, offline real não faz sentido (nada para mostrar sem internet). Por isso vou **omitir o service worker** e entregar só a instalabilidade.

Arquivos:
- `public/manifest.webmanifest` com: name "Admin Fotos IA", short_name "Admin Fotos", `display: "standalone"`, `background_color: "#0D0D0D"`, `theme_color: "#C9A84C"`, `start_url: "/admin"`, ícones 192/512 (gerados a partir do ícone de câmera Lucide em SVG → PNG)
- `public/icon-192.png` e `public/icon-512.png` (ícone de câmera dourado sobre fundo `#0D0D0D`)
- `index.html`: adicionar `<link rel="manifest">`, `<meta name="theme-color" content="#C9A84C">`, `<link rel="apple-touch-icon">`

## Detalhes técnicos

- Migração SQL única: `ALTER TABLE pedidos ADD COLUMN outra_pessoa text;`
- Tipo gerado em `src/integrations/supabase/types.ts` será atualizado automaticamente após a migração
- Não vou tocar em `client.ts`, `types.ts`, `.env` nem em `supabase/config.toml`
- Vou gerar os PNGs do ícone com ImageMagick (via nix) a partir de um SVG inline com a câmera

Posso seguir?