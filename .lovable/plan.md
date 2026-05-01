## Ajustes visuais pontuais no formulário

Mudanças apenas de estilo — nenhuma alteração em lógica, validação ou backend.

### 1. Tipografia (H1 mobile)
Em `src/pages/Index.tsx`, aumentar levemente o tamanho mínimo do H1 para mais impacto no mobile, mantendo "Ultra-Realista" em dourado.
- Trocar `text-[clamp(2rem,5vw,3rem)]` por `text-[clamp(2.5rem,7vw,3rem)]`.
- Apenas as linhas em branco ("Foto" / "com o seu Ídolo") são afetadas pelo tamanho — o `<span className="text-gold">` continua igual.

### 2. Inputs e Selects — borda visível
Atualmente a borda fica abafada (token `--border` com opacidade 0.4 no tailwind).

Em `src/index.css`, ajustar o token `--input` para que `Input`, `Select` e `Textarea` (que usam `border-input`) tenham borda sólida visível:
- `--input: 0 0% 16.5%;` (≈ #2A2A2A)
- Mantém o fundo dos campos como está.

Como `Input`, `SelectTrigger` e `Textarea` já usam `border border-input`, a mudança propaga automaticamente sem editar componentes.

### 3. Área de upload da selfie
Em `src/components/SelfieUpload.tsx`:
- Trocar `border border-dashed` por `border-[1.5px] border-dashed`.
- Trocar a cor da borda por `#2A2A2A` (usar `border-[#2A2A2A]` e `hover:border-gold`).
- Trocar `rounded` por `rounded-[12px]`.
- Manter fundo `bg-surface-1` (≈ #181818, equivalente ao #1A1A1A pedido).

### 4. Resumo do pedido — hierarquia label/valor
Em `src/pages/Index.tsx`, dentro do bloco "RESUMO DO PEDIDO":

**Labels (NOME, WHATSAPP, etc.)**
- De `text-[0.7rem] ... text-muted-foreground` para `text-[11px] uppercase tracking-[0.08em] text-[#666666]`.

**Valores preenchidos**
- De `text-[0.85rem] text-foreground` para `text-[14px] sm:text-[15px] font-medium text-[#F5F0E8]`.

**Bloco "Valor do pedido"**
- Label: manter pequeno e cinza (`text-[11px] text-[#666666]`).
- Valor: forçar dourado `#C9A84C`, `font-bold`, e tamanho maior que os demais campos do resumo (manter `font-display text-3xl` mas trocar a cor para `text-[#C9A84C] font-bold`).

### 5. Botão CTA
No `<Button type="submit">` em `src/pages/Index.tsx`:
- Adicionar `rounded-[4px]` para sobrepor o `rounded-md` padrão do componente.
- Manter `bg-gold text-background` (#C9A84C / #0D0D0D) e o restante das classes intactas.

### 6. Espaçamento entre seções
Em `src/pages/Index.tsx`:
- Trocar `mb-10` por `mb-6` nas seções? Não — o pedido é **aumentar** o respiro para 24px.
- `mb-10` = 40px (atual). Reduzir para `mb-6` = 24px conforme o valor solicitado, aplicado nas seções "Seus dados", "Seu pedido", "Sua selfie" e antes do "Resumo".

Correção: o usuário diz "atualmente está apertado" e pede 24px. Como `mb-10` já é 40px, vou interpretar como aumentar o gap **interno** entre blocos dentro de cada seção, não entre seções. Para evitar erro de interpretação, vou:
- Manter `mb-10` (40px) entre seções (já confortável).
- Aumentar o respiro entre o título da seção (`section-label`) e os campos: aumentar `mb-5` do `.section-label` (em `src/index.css`) para `mb-6` (24px).

Se o usuário quiser explicitamente 24px entre seções, basta avisar e troco `mb-10` por `mb-6`.

### Arquivos afetados
- `src/pages/Index.tsx` — H1, hierarquia do resumo, CTA radius.
- `src/index.css` — token `--input`, espaçamento do `.section-label`.
- `src/components/SelfieUpload.tsx` — borda tracejada e radius.
