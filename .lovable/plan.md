## Adicionar caixa "Pedir foto com qualquer pessoa"

Em `src/pages/Index.tsx`, logo abaixo do select "Com quem você quer a foto?" (e antes do bloco condicional que aparece quando `personalidade === "outro"`), adicionar uma caixa clicável que deixa claro que o usuário pode pedir foto com qualquer pessoa, não apenas as listadas.

### Comportamento

- A caixa fica sempre visível, abaixo do select de personalidade.
- Ao clicar, define `personalidade = "outro"` no formulário (mesmo efeito de selecionar "Outro" no dropdown), o que automaticamente abre o campo "Quem é a personalidade?" já existente.
- Quando `personalidade === "outro"`, a caixa fica destacada (borda dourada) indicando que está ativa.

### Visual

- Caixa com borda sutil, fundo `surface-2`, padding confortável, cantos arredondados.
- Ícone pequeno (ex: `UserPlus` do lucide) à esquerda em dourado.
- Título curto: **"Quero foto com outra pessoa"**
- Linha de apoio em `text-muted-foreground` menor: "Atriz, atleta, familiar, amigo… qualquer pessoa pública ou privada."
- Estado ativo: `border-gold` + leve `bg-gold/5`.
- Acessível: `<button type="button">` para não submeter o form.

### Detalhes técnicos

- Importar `UserPlus` de `lucide-react`.
- Inserir o bloco entre o `</div>` que fecha o campo do select de personalidade (linha ~202) e o `{personalidade === "outro" && (` (linha ~204).
- Nenhuma mudança em schema, validação, `order.ts`, banco ou submit. A caixa é apenas um atalho de UI para o valor "outro" que já existe.

### Arquivos alterados

```text
src/pages/Index.tsx   adiciona caixa-atalho abaixo do select de personalidade
```
