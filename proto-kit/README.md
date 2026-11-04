# proto-kit — общий каркас экрана прототипа

Стандарт: `rules.md`, раздел 0.1. Один файл `proto-kit.js`, без зависимостей. Даёт:
- запуск уровня по адресу `?level=N` (без параметра — home), адрес обновляется при переходах;
- лоадинг-скрин перед уровнем (иконка, название, прогресс-бар с бликом, искры, ~1.1 с);
- переход в home и обратно; favicon из иконки; плитка-иконка для home (`iconTile`);
- метки для аудитора: `window.__proto {slug, levels, kit, iconImage, screen}`, `<html data-pk-screen="loading|game|home">`.

```js
ProtoKit.init({slug, name, icon:'icon.png', iconEmoji:'🎮', accent:'#5b8cf0', levels,
  minLoad:1100,                 // длительность лоадера, мс
  startLevel(n){...}, showHome(){...}});
ProtoKit.play(n); ProtoKit.home(); ProtoKit.iconTile(size); ProtoKit.urlLevel();
```
Иконка: `deploy/<slug>/icon.png` 512×512 без скругления. Нет файла — эмодзи на градиенте `accent`.
Эталон подключения: `deploy/arrowsort/v2.html`. Правки модуля — новой версией `KIT_VERSION` и заметкой здесь.

Версии: 1.0 (2026-09-17) — первый выпуск.
