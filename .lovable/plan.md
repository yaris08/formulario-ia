## Trocar caixa-atalho por campo de texto livre

Em `src/pages/Index.tsx`, remover a caixa-botão "Quero foto com outra pessoa" e colocar no lugar um **campo de texto simples sempre visível**, igual ao de Observações.

### Comportamento

- O campo aparece logo abaixo do select "Com quem você quer a foto?".
- Label: **"Outra pessoa (opcional)"**.
- Placeholder: "Digite o nome de qualquer pessoa".
- Texto de apoio menor abaixo: "Atriz, atleta, familiar, amigo… qualquer pessoa pública ou privada."
- Quando o usuário digita algo no campo, automaticamente seta `personalidade = "outro"` no form (para passar na validação do schema, que exige uma das duas: opção do select OU `personalidade_outro` preenchido com `personalidade = "outro"`).
- O bloco condicional antigo `{personalidade === "outro" && (…)}` é removido (vira redundante, já que o campo está sempre visível).
- Remover import não usado de `UserPlus`.

### Detalhes técnicos

- Usar `<Input>` registrado com `form.register("personalidade_outro")` mais um `onChange` customizado que também chama `form.setValue("personalidade", "outro")` quando o valor não está vazio.
- Remover linhas 203-225 (botão) e 228-239 (bloco condicional).
- Inserir o novo `<div className="mb-5">` com Input + texto de apoio entre o fechamento do div do select e o `<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">` da quantidade.
- Nenhuma mudança em `order.ts`, schema, banco ou submit. O submit já trata `personalidade === "outro"` usando `personalidade_outro`.

### Arquivos alterados

```text
src/pages/Index.tsx   substitui caixa-botão por Input livre sempre visível
```
