# Правки масштаба Claude — 23.10.2026

Сравнение текущего `atlas.json` со снимком `history/before-kf-sizes-names-2026-10-23/atlas.json`. Это итоговая версия после последующих уточнений горки, экскаватора, лайнера, хомяка, льва и самоката. Промежуточные значения в скриптах не являются итоговыми.

## Итог

- 600 объектов / 300 уникальных пар сохранены; изображения не менялись.
- `kf` добавлен или пересчитан у всех 600 объектов по видимой альфе на выбранной оси. Удалены 4 устаревших ручных коэффициента.
- 34 значения `size_m` изменены; у 17 объектов изменён `dimension`, у 3 — `axis`.
- 92 названия новых объектов переведены на английский для игры; русские сохранены в `name_ru`. Отдельно уточнено название Sydney Harbour Bridge (arch).
- Партнёры переставлены в 14 слотах. Составы всех 300 пар остаются уникальными, каждый объект используется один раз.
- Пересобраны v45–v49 и игровая примерка; Unity-архив создан в прежнем формате.

## Числа и оси

| Ключ | Было | Стало | Основание |
|---|---|---|---|
| `trex` | 12 м · length · w | 5 м · height · h | Art is a front 3/4 pose; 12 m length stretched onto the canvas width made it ~14 m tall. Standing height with raised head. |
| `ant` | 0.003 м · length · w | 0.005 м · full length incl. legs · w | Art shows legs and antennae across the canvas width; 3 mm was the body. |
| `lion` | 1.2 м · height · h | 1.4 м · height to top of head · h | Standing lion with raised head: 1.2 m is the shoulder height, the canvas top is the head/mane (manifest override fixed). |
| `helicopter` | 19.8 м · length · w | 13 м · length · w | Art shows a light utility helicopter (H125/EC135 class, 12-13 m incl. rotor); 19.8 m described a medium helicopter. |
| `mosquito` | 0.006 м · length · w | 0.012 м · full length incl. legs · w | Art shows the mosquito with legs spread across the canvas width; 6 mm was the body only. |
| `cruiseship` | 300 м · length · w | 65 м · height above waterline · h | Art is a strongly foreshortened 3/4 view (stern cropped); 300 m length stretched onto the canvas width made the ship 214 m tall, above the 134 m bridge arch. Height above waterline of a ~300 m cruise ship. |
| `camera_quadcopter` | 0.6 м · width · w | 0.5 м · width · w | Folding camera drone ~0.5 m across; pair with the 0.6 m squirrel was exactly x1. |
| `tracked_excavator` | 9.5 м · length · w | 6.5 м · visible width · w | art shows the folded transport pose (tracks = 68 % of the visible width, track ~4.5 m); 9.5 m was the length with the boom extended. |
| `mangrove_tree` | 10 м · height · h | 12 м · height · h | Mangrove 12 m; pair with the 10 m hang glider was exactly x1. |
| `hamster` | 0.12 м · length · w | 0.08 м · width (sitting) · w | Art is a front-facing sitting hamster: the visible width is the body width (~8 cm), not the 12 cm nose-to-tail length. |
| `compsognathus` | 1 м · length · w | 0.9 м · length · w | Compsognathus 0.9 m; pair with the 1 m rafflesia was exactly x1. |
| `kick_scooter` | 1.1 м · height · h | 0.9 м · height · h | Art shows a kids kick scooter (handlebar ~0.9 m); 1.1 m was an adult scooter. |
| `surfboard` | 2 м · length · h | 2.1 м · length · h | 7 ft board; pair with the 2 m reindeer was exactly x1. |
| `yurt` | 4 м · width · w | 5 м · width · w | Typical yurt 5 m; pair with the 4 m hatchback was exactly x1. |
| `playground_slide` | 3 м · length · w | 1.6 м · length · w | Chute is 40 % of the visible width and the ladder has 4 steps: a 1.6 m kids slide, 1.2 m looked too small by chute width. |
| `rope_bridge` | 30 м · length · w | 8 м · length · w | Art shows a short garden rope bridge on two posts (~10 planks); 30 m described a gorge suspension bridge. |
| `lego_brick` | 0.01 м · length · w | 0.032 м · length · w | 2x4 brick is 31.8 mm long; 0.01 m was the height. |
| `drill` | 0.25 м · length · w | 0.23 м · length · w | Cordless drill 23 cm; pair with the 0.25 m guinea pig was exactly x1. |
| `sydney_harbour_bridge` | 503 м · length · w | 503 м · arch span · w | Art shows the arch with pylons only; 503 m is the arch span, not the 1149 m full bridge. |
| `key` | 0.06 м · length · w | 0.065 м · length · w | House key 6.5 cm; pair with the 0.06 m mouse was exactly x1. |
| `new_257_b` | 0.45 м · full length incl. antennae · w | 0.38 м · visible width · w | Stick insect drawn diagonally; 0.45 m incl. antennae projected onto the canvas width. |
| `new_262_b` | 0.5 м · height · h | 0.1 м · height · h | Large tin soldier figurine; 0.5 m was a display-size value. |
| `new_263_a` | 1.5 м · height · h | 0.3 м · height · h | Home-made gingerbread house; 1.5 m was a shop-window value. |
| `new_268_a` | 2 м · height · h | 1 м · height · h | Large home crystal chandelier; 2 m was a ballroom value. |
| `new_269_a` | 0.3 м · length · w | 0.28 м · length · w | Durian 28 cm; pair with the 0.3 m trowel was exactly x1. |
| `new_270_b` | 0.4 м · length · w | 0.25 м · length · w | Ordinary lunch box; 0.4 m was exaggerated. |
| `new_272_a` | 1.5 м · width · w | 2.1 м · visible width · w | Grand piano in 3/4 view: the canvas width is the long side (~2.1 m), not the 1.5 m keyboard width. |
| `new_273_b` | 0.35 м · length incl. handle · w | 0.3 м · visible width · w | Garden trowel drawn diagonally; 0.35 m incl. handle projected onto the canvas width. |
| `new_278_b` | 0.2 м · length · w | 0.17 м · visible width · w | Green anole drawn diagonally; 0.2 m length projected onto the canvas width. |
| `new_287_b` | 0.34 м · length · w | 0.3 м · visible width · w | 3U CubeSat drawn diagonally; 0.34 m projected onto the canvas width. |
| `new_292_a` | 1.2 м · length · w | 1.05 м · visible width · w | Trombone drawn slightly diagonal; 1.2 m projected onto the canvas width. |
| `new_292_b` | 0.32 м · length · w | 0.27 м · visible width · w | Piccolo drawn at ~31 deg; 0.32 m full length projected onto the canvas width. |
| `new_293_b` | 0.25 м · width · h | 0.25 м · diameter · w | Tambourine: diameter measured across the canvas width (was 'width' on axis h). |
| `new_294_a` | 0.65 м · length · w | 0.57 м · visible width · w | Baguette drawn at ~28 deg; 0.65 m length projected onto the canvas width. |
| `monster_truck_wheel` | 0.9 м · diameter · w | 1.7 м · diameter · w | Monster truck tyre (66 in) is 1.68 m; 0.9 m was a pickup tyre. |
| `mountain_cableway_station` | 100 м · width · w | 40 м · width · w | Art shows a two-storey station; 100 m was exaggerated. |

## Перестановки пар

| № | Было | Стало |
|---:|---|---|
| 72 | `colosseum` / `cloud_gate` | `machu_picchu_citadel` / `colosseum` |
| 88 | `whale` / `great_wall_75m_segment` | `whale` / `cloud_gate` |
| 203 | `christmas_red_truck` / `canoe_paddle` | `christmas_red_truck` / `kinetic_wind_sculpture` |
| 206 | `glowing_star_topper` / `giant_storybook_mushroom` | `glowing_star_topper` / `canoe_paddle` |
| 214 | `colosseum_facade_section` / `new_year_countdown_clock` | `new_290_b` / `colosseum_facade_section` |
| 228 | `storybook_royal_throne` / `kinetic_wind_sculpture` | `storybook_royal_throne` / `christmas_fireplace_gifts` |
| 236 | `machu_picchu_citadel` / `geyser_basin` | `geyser_basin` / `art_deco_radio_tower` |
| 243 | `holiday_light_arch` / `alpine_observation_tower` | `new_year_countdown_clock` / `holiday_light_arch` |
| 250 | `christmas_fireplace_gifts` / `art_deco_radio_tower` | `great_wall_75m_segment` / `alpine_observation_tower` |
| 251 | `glass_slipper` / `harvest_scarecrow` | `new_262_b` / `glass_slipper` |
| 256 | `new_255_a` / `new_261_b` | `new_255_a` / `new_260_a` |
| 266 | `new_260_a` / `new_288_a` | `new_261_b` / `new_288_a` |
| 269 | `new_262_b` / `new_276_a` | `new_276_a` / `new_278_a` |
| 291 | `new_278_a` / `new_290_b` | `harvest_scarecrow` / `giant_storybook_mushroom` |

## Файлы и проверка

- Источники: `atlas.json`, `game-content.json`, `unique-pairs-2026-10-19.json`; поэтапные скрипты `apply-kf-sizes-names-2026-10-23.py`, `apply-pair-repairs-2026-10-23.py`, `apply-pair-audit-2026-10-23.py`, последующие одиночные правки через `set-size.py`.
- Исходный запрос и замеры прозрачных полей: `fix-request-padding-kf-2026-10-23.md`.
- Снимки до этапов: `history/before-kf-sizes-names-2026-10-23/`, `history/before-pair-repairs-2026-10-23/`, `history/before-pair-audit-2026-10-23/`, `history/before-excavator-2026-10-23/`.
- Экспорт: `../handoff/SizeMatch-v45-Unity-Content-2026-10-23-600.zip`, отчёт `../handoff/SizeMatch-v45-Unity-Content-2026-10-23-600-checks.json`.
- Постоянные правила для следующих правок: [`SCALE_RULES.md`](SCALE_RULES.md).
