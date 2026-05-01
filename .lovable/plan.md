# Corrigir acesso do painel admin

O problema atual é este:

- o sistema está entendendo que o usuário `justafiliado@proton.me` **já existe** (`admin-status` respondeu `exists: true`)
- mas o backend ainda está tratando esse usuário como **não confirmado** (`email_not_confirmed`)

Por isso acontece o bloqueio duplo:

1. a tela mostra **login** em vez de **criar senha**
2. ao tentar entrar, o login falha com erro

## O que vou ajustar

### 1. Corrigir a configuração de autenticação
Aplicar de forma efetiva a configuração para permitir acesso imediato sem confirmação de e-mail, como você pediu.

### 2. Reparar o usuário admin já criado
O e-mail autorizado já ficou salvo num estado inconsistente. Vou corrigir isso para que o acesso volte a funcionar.

A solução mais segura e previsível é:
- limpar/reparar o registro atual do admin que ficou pendente de confirmação
- manter o acesso exclusivo ao e-mail `justafiliado@proton.me`
- preservar a atribuição automática de perfil admin

### 3. Melhorar a detecção de “primeiro acesso”
Hoje a lógica só verifica se o usuário existe. Vou mudar para verificar o estado real da conta:

- `not_found` → nunca foi criado
- `pending_confirmation` → existe, mas ainda não está pronto para login
- `ready` → pode fazer login normalmente

Assim a tela deixa de mandar você para um login quebrado.

### 4. Ajustar a tela `/admin/login`
Vou refinar o comportamento para ficar assim:

- se for **primeiro acesso** ou conta pendente, exibir **CRIAR SENHA E ENTRAR**
- se a conta estiver pronta, exibir o login normal
- se houver erro do backend como `email_not_confirmed`, mostrar uma mensagem amigável e conduzir para o fluxo correto
- continuar sem opção pública de “Criar conta”

### 5. Validar o fluxo final
O resultado esperado depois do ajuste:

- no primeiro acesso, você define a senha e entra
- nos acessos seguintes, usa apenas e-mail + senha
- qualquer e-mail diferente do autorizado continua sendo expulso do painel

## Detalhes técnicos

- Ajustar a configuração de autenticação do backend
- Revisar a função `admin-status` para retornar estado mais completo
- Atualizar `src/pages/AdminLogin.tsx` para usar esse novo estado
- Garantir que o usuário admin existente seja corrigido para não ficar preso em `email_not_confirmed`

Se você aprovar, eu faço esse reparo agora.