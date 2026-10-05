# Auto Daily: plano do vídeo de lançamento

**O que é:** um app aberto que transforma commits do Azure DevOps e horas do OptSolv em um rascunho de daily que você revisa e copia.
**Para quem:** devs que fazem daily e registram trabalho no Azure DevOps e/ou OptSolv Time Tracker.
**O que o diferencia:** a IA só escreve o que as fontes registram; o que falta chega marcado para revisão, e a palavra final é da pessoa.
**Afirmação mais forte:** "Nada é inventado." (regras de evidência reais do prompt).
**Gancho visual:** o relógio em rolos da homepage girando até 09:12, com a daily às 09:30.
**UI real mostrada:** hero com o ReportDocument real, chips de commits/horas, rascunho se compondo, lacunas marcadas sendo substituídas no editor, campo verde das 09:30.
**Tom:** `polished` com um sorriso: sério, elegante, a graça vem do relógio correndo contra a daily.
**Legenda de compartilhamento:** "São 09:12 e a daily é às 09:30."

## Ângulo

A homepage nova conta a manhã antes da daily. O vídeo é essa manhã comprimida em 20 segundos: o relógio é o fio, o produto trabalha na tela, às 09:30 o verde toma conta.

## Identidade

- Canvas `#F5F7F6`, ink `#192820`, verde de ação `#176344`, menta `#86D6AD`.
- Geist (voz) e Geist Mono (horários/dados).
- Símbolo "Daily aberto". Componentes e CSS reais do app (`globals.css` compilado, markup renderizado).

## Storyboard (20 s, 1920×1080, 30 fps)

| # | Tempo | Cena | Texto na tela | Motion |
|---|---|---|---|---|
| 1 | 0.0–2.6 | Gancho | "09:12" gigante + "A daily é às 09:30." | Rolos giram uma volta e param em 09:12; legenda entra |
| 2 | 2.6–5.4 | Revelação | Marca Auto Daily + "Seu trabalho, bem contado." | Relógio encolhe para o canto; símbolo e título sobem em máscara |
| 3 | 5.4–8.6 | Fontes | "Commits e horas viram rascunho." | Chips reais (Azure, OptSolv) entram e caem no documento; relógio 09:14 |
| 4 | 8.6–11.8 | Rascunho | "A IA escreve só o que as fontes registram." | ReportDocument real se compõe linha a linha; relógio 09:16 |
| 5 | 11.8–15.2 | Revisão | "O que falta vem marcado. Você decide." | Lacunas em âmbar pulsam e são reescritas no editor; relógio 09:21 |
| 6 | 15.2–20.0 | Desfecho | "09:30. Pronto para a daily." → cartão final: marca, "Código aberto", URL do GitHub | Relógio vira 09:30, círculo verde cresce do relógio; cartão final assentado (pôster) |

## Som

Trilha a 104 BPM em Lá maior: pad quente (I–vi–IV–V), arpejo de pluck suave, kick abafado a partir da revelação. Os efeitos vivem na mesma tonalidade e no mesmo espaço: tique do relógio como woodblock afinado (notas da escala) baixo na mixagem, um sopro filtrado no crescimento do círculo verde, e um sino de tríade (Lá maior) em "Pronto para a daily".
