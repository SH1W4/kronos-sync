---
docsync:
  version: 1.0.0
  audience: admin
  priority: high
  intent: marketplace
---
# Estratégia de Comissões: Marketplace & Produtos

Este documento define a lógica de comissões para produtos vendidos no Marketplace do KRONØS.

## 1. Modelo de Comissão por Tipo de Produto

### Flash Tattoos (Produtos Físicos)
- **Comissão Padrão do Estúdio**: 25-30%
- **Justificativa**: O estúdio fornece infraestrutura física (espaço, equipamentos, materiais).
- **Configuração**: Definida por produto ou por artista nas configurações.

### Artes Digitais (Produtos Digitais)
- **Comissão Padrão do Estúdio**: 15-20%
- **Justificativa**: Menor overhead operacional, apenas plataforma e marketing.
- **Configuração**: Pode ser ajustada para incentivar criação de conteúdo digital.

## 2. Fluxo de Pagamento

1. **Cliente compra produto** no Marketplace
2. **Artista recebe 100%** do valor via PIX
3. **Sistema calcula automaticamente** a comissão do estúdio
4. **Artista repassa** a comissão configurada para a chave PIX do estúdio
5. **IA valida** o comprovante de repasse

## 3. Estratégias de Precificação

### Produtos de Entrada (Flash Tattoos Pequenas)
- Preço: R$ 150-250
- Comissão: 25%
- **Objetivo**: Alto volume, conversão rápida

### Produtos Premium (Artes Exclusivas)
- Preço: R$ 500+
- Comissão: 20%
- **Objetivo**: Margem maior para o artista, incentivo à qualidade

### Packs Digitais
- Preço: R$ 200-400
- Comissão: 15%
- **Objetivo**: Receita passiva, escalabilidade

## 4. Monitoramento & Ajustes

- **Dashboard de Vendas**: Acompanhe o desempenho de cada produto
- **Análise de Conversão**: Identifique quais produtos geram mais receita
- **Ajuste Dinâmico**: Reduza comissões para artistas de alto desempenho como incentivo

---
*KRONØS // Marketplace Intelligence*
