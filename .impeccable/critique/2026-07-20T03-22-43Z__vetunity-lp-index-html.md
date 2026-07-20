---
target: vetunity-lp/index.html
total_score: 30
p0_count: 2
p1_count: 2
timestamp: 2026-07-20T03-22-43Z
slug: vetunity-lp-index-html
---
# Critique — vetunity-lp/index.html (20/07/2026, pós-alterações do usuário)

## Notas

| Critério | Nota | Veredito |
|---|---|---|
| ID visual | 8,0 | Anton + mono + vermelho + grunge com texturas próprias. Coeso e autoral. |
| Design | 7,5 | Painéis com visuais distintos por aba; simulador bidirecional. Hierarquia da seção 3 confusa. |
| Copy | 6,0 | Hero perdeu tensão; título da seção 4 desalinhado; "7 páginas" fossilizado; footer truncado. |
| Conversão | 6,0 | CTA com mensagem dinâmica é ótimo, mas sem prazo, pagamento, contato no rodapé ou urgência. |
| Conteúdo | 6,0 | Diagnóstico específico e bom. Seção de prints reais sumiu; "plano de ação" entrega diagnóstico. |
| AI Slop | 8,5 | Quase zero. Não parece template. |
| Valor | 6,0 | Âncora -45% crível, mas escopo raso e prestador sem credenciais. |
| **Média** | **6,9** | Base visual forte, embalagem comercial incompleta. |

## Anti-patterns

LLM: quase zero slop. Grunge com texturas reais, Anton condensed, simulador custom, painéis heterogêneos.
Detector: 2× `background: #000` puro (styles.css:1364, 1516); `single-font` é falso positivo (3 famílias no link).

## Priority Issues

- **[P0] Seção promete solução, entrega diagnóstico.** Tabs S.01–S.05 dentro de "02 — Plano de ação / O tratamento" mas painéis dizem "DIAGNÓSTICO 01/05". Solução vira caixinha de 1 linha. Renomear para diagnóstico OU expandir soluções.
- **[P0] Proposta comercial sem prazo, pagamento e contato.** Zero ocorrências de "prazo"/"pagamento". Footer só "LUCAS LIAM - 2026", `<strong>` não fechado, sem WhatsApp/e-mail. Quem não clica no CTA não tem como fechar.
- **[P1] "7 páginas completas" fossilizado.** Simulador em 3 páginas mostra "3 páginas x R$275" e logo abaixo "7 páginas completas". Tornar dinâmico.
- **[P1] Seção 2 do PRD desapareceu.** print-navegacao/conversao/equipe órfãos em assets/. Diagnóstico virou texto+ilustração; perdeu a prova visual do site atual.
- **[P2] Overlay grunge nunca carrega.** `assets/grunge-overlay.png` não existe (há grunge-black.png e grunge-transparent.png); cai sempre no fallback SVG.
- **[P2] Logo do prestador 5× dentro do dossiê**, com `alt="Logo"` (decorativo, deveria ser `alt=""`).
- **[P2] Numeração quebrada:** Estimativa (sem nº), 02, 03. Dois `section--alt` consecutivos sem alternância.
- **[P3] Hero sem tensão e sem número.** "Um site à altura da VetUnity" é neutro; versão anterior confrontava. Âncora saiu do hero.

## Minor

Camadas de textura duplicam o texto no DOM (SEO/cópia); `user-select: none` já resolve a seleção. Título da seção 4 ("O custo de não ter um site bom") promete custo da inação, entrega preço.
