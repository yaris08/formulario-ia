## Ajustes no formulário

### 1. Remover campo "Estado"
- `src/pages/Index.tsx`: remover o `Select` de Estado (campo da seção "Seus dados"). O campo WhatsApp passa a ocupar a linha inteira.
- `src/pages/Index.tsx` (`onSubmit`): não enviar mais `estado` no insert do pedido.
- `src/lib/order.ts`: remover `estado` do `orderSchema` (e remover/ignorar `ESTADOS_BR` do import em `Index.tsx`). A constante pode ficar exportada caso o admin ainda use, mas removerei o uso na página pública.
- `src/pages/AdminDashboard.tsx`: remover qualquer exibição da coluna `estado` (continua existindo na tabela do banco como nullable já — não precisa migration).

Observação: a coluna `estado` no banco é `NOT NULL` hoje. Vou rodar uma migration curta para torná-la `NULLABLE`, assim novos pedidos sem estado funcionam sem quebrar registros antigos.

### 2. Atualizar tabela de preços/quantidades
Em `src/lib/order.ts`:

```text
1 foto  — R$ 8,90
2 fotos — R$ 15,00
3 fotos — R$ 20,00
4 fotos — R$ 24,90   (novo valor, antes era "combinar")
10 fotos — R$ 34,90  (nova opção)
```

- Atualizar `QUANTIDADE_OPTIONS` e `PRICE_MAP` com esses 5 valores.
- Atualizar o enum do Zod: `z.enum(["1","2","3","4","10"])`.
- Em `Index.tsx` remover o tratamento especial de "combinar" na caixa de preço (todos os valores agora são numéricos).

### 3. Caixa de preço atualiza dinamicamente
Já está reativa via `form.watch("quantidade")` + `useMemo`. Vou apenas garantir que o valor padrão exibido antes de qualquer seleção seja "—" (em vez de "8,90"), para deixar claro que ele muda conforme a escolha do usuário.

### 4. Atualizar título
Em `src/pages/Index.tsx`, alterar:

```text
Foto Ultra-Realista
com o Mito
```
para
```text
Foto Ultra-Realista
com o Mito ou o Ídolo
```

(mantendo "Ultra-Realista" em dourado).

### Arquivos alterados

```text
src/lib/order.ts            preços + enum + remover estado do schema
src/pages/Index.tsx         remove campo Estado, novo título, preço dinâmico "—"
src/pages/AdminDashboard.tsx  remove exibição da coluna estado
supabase migration          ALTER TABLE pedidos ALTER COLUMN estado DROP NOT NULL
```
