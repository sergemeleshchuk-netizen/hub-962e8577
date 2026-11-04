# Size Match — store listing demo (App Store + Google Play)

**Открыть: `index.html`.** На ПК: переключатели Phone (рамка телефона, вид приложений App Store / Google Play) и Web (вид сайтов сторов). На телефоне открывается во весь экран, стор выбирается по ОС.

## Что можно делать
- Листать скриншоты свайпом, тап открывает полноэкранный просмотр; первый слот = превью-видео (UGC-ролик «Wildest size comparisons»).
- **GET → загрузка → OPEN** и **Install → Installing % → Play** запускают саму игру (Size Match v10 с хаба). Назад: полоска home внизу (Phone) или «Close game» (Web).
- Share, Version History, все отзывы, Data safety, Tap to Rate, wishlist, поиск.
- Цифры, отзывы, даты и What's new — заполнители, помечено DEMO.

## Файлы
- `screenshots/appstore_1290x2796/01..08.jpg` (на хабе только JPG q92 из-за лимита места Surge; PNG без потерь — в `ASO/_ours/size-match/out/ios|gp/`, дубли PNG с хаба убраны 2026-09-28) — набор для App Store (iPhone 6.9"), `screenshots/googleplay_1080x1920/` — для Google Play, `screenshots/icon_512.png` — иконка.
- `store_texts.md` — название, подзаголовок, описания, ключевые слова, подписи кадров.
- Видео-превью на странице нет: вместо него первым кадром стоит уровень, с которого начинается
  рекламный ролик (v4A, раунд 1: Нептун → Африка, догадка ×0.6). Мастер ролика — в
  `video creatives/SizeMatch-RND1/Video/`. `ios/`, `gp/`, `icon.jpg` — лёгкие копии для страницы.

Собрано 2026-09-21 по рецепту `B1 SS/ASO/ANALYSIS.md` (раздел 7) и первому листингу Hexa Tiles Out. Исходники кадров: `B1 SS/ASO/_ours/size-match/`.
