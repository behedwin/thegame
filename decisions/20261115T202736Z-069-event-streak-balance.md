# 069: Eventsvitens storlek och hur en miss upptäcks

## Beslut
- Bonus: från 3 lösta i rad får nästa event +5 % effekt, sedan +5 % per steg, högst +20 % (svit 6+).
  Uppgiftens exempel (+10 %/steg, tak +50 %) var bara "t.ex.".
- För buffar förstärks den extra delen (1 + (mult − 1) × (1 + bonus)), inte hela multiplikatorn, så att
  "+10 % effekt" betyder samma sak för ×1,5 och ×3.
- En miss upptäcks när nästa event dyker upp (fältet `eventOpen`), inte i `tick()`. Kortet är det enda som
  visar sviten och syns bara när ett event är aktivt, så spelaren ser ingen skillnad. Det håller ändringen
  inom uppgiftens `touches`.
- Ett event som försvinner vid nytt läsår räknas som missat.

## Varför
Första prestige för seed 109 (tidigaste seeden, 1 952 s före ändringen) mot golvet 1 800 s:

| step / cap | Seed 109 (s) |
|---|---|
| 0,10 / 0,50 | 1 552 (faller) |
| 0,10 / 0,50, bara buffar | 1 848 |
| 0,05 / 0,25 | 1 684 (faller) |
| 0,05 / 0,20 | 1 864 |
| 0,10 / 0,20 | 1 868 |
| 0,05 / 0,15 | 1 876 |
| 0,05 / 0,10 | 1 896 |

0,05 / 0,20 ger fyra synliga steg att jaga och håller marginal till grinden. Att bara förstärka buffar
avvisades, eftersom uppgiften säger att varje löst event ska ge bonus.
