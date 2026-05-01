## Substituir caixa de "Valor do pedido" por resumo do pedido

Em `src/pages/Index.tsx`, substituir o bloco atual (apenas valor + texto do Pix lado a lado) por uma caixa única de **Resumo do pedido** que mostra, em tempo real conforme o usuário preenche:

- Nome
- WhatsApp
- Personalidade (usa o valor de "Outro" se for o caso)
- Quantidade (ex: "2 fotos")
- Cenário (se selecionado)
- Observações (só aparece se preenchido)

Logo abaixo da lista, separado por uma linha dourada sutil:

- **Valor do pedido** alinhado à direita, usando o mesmo display dourado de hoje (ou "—" se a quantidade ainda não foi escolhida).

Por último, dentro da mesma caixa:

- "O pagamento é feito via Pix **somente após você aprovar a foto**. Sem risco."

Cada campo não preenchido aparece como "—" para o resumo nunca ficar vazio. A reatividade é via `form.watch()`, sem alterar lógica de submit, validação, schema ou backend.

### Arquivos alterados

```text
src/pages/Index.tsx   substitui o bloco "PRICE" por um bloco "RESUMO DO PEDIDO"
```
