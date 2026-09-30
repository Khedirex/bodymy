# Reto 14 días en la cama — pendências e decisões

## Pendente
1. **Vídeos (14).** `lessons.panda_video_id` está NULL em todos os dias, e o app mostra "El video de hoy llega pronto".
   Códigos de gravação: `VIDEO_DIA_01_PENDIENTE` … `VIDEO_DIA_14_PENDIENTE` (nos roteiros).
   O SQL para cadastrar cada vídeo está no README, seção "Reto 14 días en la cama".
   Não existe tela de admin para vídeo de aula; hoje é só por SQL.
2. **Thumbnails.** O esquema não tem campo de thumbnail por aula. Só existe `programs.capa_url`, que não foi alterado.
3. **Duração real dos vídeos.** `lessons.duracao_min` está com a estimativa do roteiro; atualizar depois de gravar.
4. **Autoavaliação (dias 7 e 14).** O app não tem quiz nem checklist. As 5 perguntas estão no texto de apoio e no roteiro, e a aluna anota num papel.
   Nada é salvo no banco.
5. **Parte 2 (silla).** O dia 14 convida para a Parte 2, mas esse produto/link não existe no app.
6. **Página de introdução.** O esquema não tem esse campo. Virou a aula "Bienvenida — Empieza aquí" (dia 0), com link no Día 1 do `/treino` e listada em "Guías del reto".

## ⚠️ Conflito: doses × 10–15 min
Com as doses da tabela aplicadas ao pé da letra, a estimativa de vários dias passa de 15 min:

| Dia | Estimativa | | Dia | Estimativa |
|---|---|---|---|---|
| 1 | 14 min | | 8 | 13 min |
| 2 | 15 min | | 9 | 14 min |
| 3 | 19 min | | 10 | 21 min |
| 4 | 21 min | | 11 | 24 min |
| 5 | 25 min | | 12 | 25 min |
| 6 | 28 min | | 13 | 24 min |
| 7 | 15 min | | 14 | 26 min |

(Fala de ~6–8 min a 130 palavras/min + tempo real das repetições, sustentações e descansos.)

A causa é a soma das sustentações: por exemplo, dia 6 = 10 × 10 s por lado em 4 exercícios bilaterais.
Ajustes possíveis (cada um é uma linha na fonte + `npm run gen:reto-cama`):
- **Balançar os joelhos sem sustentar** (só movimento): corta cerca de 1,5–2,5 min nos dias 4–6.
- **Parte B dos exercícios de duas partes em 1 série** (fase 2): corta cerca de 2,5 min nos dias 10–14.
- **Reduzir a fala fixa** (repetir "más fácil" e "qué NO sentir" só quando mudam): corta cerca de 1–2 min por dia.

Mesmo com os três ajustes, os dias 5–6 e 11–14 ficam em torno de 18–22 min.
Para caber em 15 min, é preciso mexer na própria dose. Por exemplo: sustentação máxima de 8 s, ou 2×8 em vez de 2×10.
Essa decisão é de vocês, porque muda a tabela.

## Interpretações aplicadas (conferir)
- "Veces" = repetições **por lado** nos exercícios de um lado por vez.
- Fase 1, "segundos" = tempo sustentando a posição de esforço em cada vez.
- Balançar os joelhos: 1 vez = direita e esquerda, sustentando nos dois lados.
- Fase 2: ritmo fixo de 2 s para subir e 2 s para descer; círculos de 2 s.
- Exercício de duas partes: 1 série = parte A + parte B. O descanso de 30 s fica entre as séries.
- Dia 12, "aguantar 10 s arriba" = na **última** vez de cada série (perna e ponte). Os dias 13 e 14 seguem só com 2×10, como na tabela.
- Perna estirada e ponte: curto/mini nos dias 8–10, completo nos dias 11–14.
- Dia 8: a tabela diz que "cambian 2, 3 y 5", mas a coluna da Fase 2 também muda os slots 1 e 4.
  Seguimos a coluna: o 1 e o 4 "suben un poquito".
- Aplastar la toalla (fase 1): um joelho por vez.
- As 4 regras de segurança são texto fixo literal. Duas passam de 12 palavras e ficaram como estão.
- Alunas no meio do reto continuam no mesmo dia (semana/dia não mudam), já com o conteúdo novo.
- Depois do dia 14, o app volta ao dia 8 (repete a segunda semana), como o circuito já fazia.
