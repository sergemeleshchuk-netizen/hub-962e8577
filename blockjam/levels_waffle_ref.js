// Waffle Sort — ТОЧНАЯ КОПИЯ референса frame0 (Block Jam slide-puzzle).
// Поле 6×7, 7 цветов, 2 центральных препятствия (obstacles), ворота по цветам.
// Режим boardClearWin: победа = поле очищено (колбы сверху — декоративный флавор, могут не сойтись).
// Раскладка — первичный read с референса; уточняется визуально (side-by-side со скрином).
const WAFFLE_LEVELS = [{
  "w": 6, "h": 7,
  "boardClearWin": true,
  "obstacles": [[2,2],[3,2],[2,4],[3,4]],
  "blocks": [
    {"id":"b0_pu","color":"purple", "cells":[[0,0],[1,0]]},                 // слайдер ↔ верх-лево
    {"id":"b1_mg","color":"magenta","cells":[[4,1],[5,1]]},                 // слайдер ↔ верх-право
    {"id":"b2_r", "color":"red",    "cells":[[0,1],[1,1],[0,2]]},           // красная L
    {"id":"b3_pu","color":"purple", "cells":[[0,3],[1,3],[0,4],[1,4]]},     // фиолет 2×2
    {"id":"b4_mg","color":"magenta","cells":[[4,2],[5,2],[5,3]]},           // малиновая L
    {"id":"b5_cy","color":"cyan",   "cells":[[4,4],[5,4],[4,5],[5,5]]},     // бирюзовый 2×2
    {"id":"b6_cy","color":"cyan",   "cells":[[0,5],[1,5]]},                 // бирюзовый мелкий
    {"id":"b7_y", "color":"yellow", "cells":[[0,6],[1,6]]},                 // жёлтая L (низ-лево)
    {"id":"b8_bl","color":"blue",   "cells":[[5,6]]},                       // синий 1×1
    {"id":"b9_y", "color":"yellow", "cells":[[4,6]]},                       // жёлтый 1×1 (низ-право)
    {"id":"b10_g","color":"green",  "cells":[[2,6],[3,6],[3,5]]}            // зелёная T (низ-центр)
  ],
  "gates": [
    {"edge":"top",   "color":"cyan",   "span":[2,3]},
    {"edge":"top",   "color":"red",    "span":[0,1]},
    {"edge":"right", "color":"magenta","span":[1,3]},
    {"edge":"right", "color":"cyan",   "span":[4,5]},
    {"edge":"right", "color":"blue",   "span":[6,6]},
    {"edge":"left",  "color":"purple", "span":[0,4]},
    {"edge":"left",  "color":"yellow", "span":[6,6]},
    {"edge":"bottom","color":"green",  "span":[2,4]},
    {"edge":"bottom","color":"yellow", "span":[0,1]}
  ],
  "maxFlasks": 3,
  "label": "1 · копия референса"
}];
