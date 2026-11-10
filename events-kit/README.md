# Stark Events Kit (web prototypes)

Isolated live-ops events for HTML prototypes. One folder, no build step, no dependencies.
Requirements and the Unity-side design live in `PLAYBOOK/events/` (01 as-is, 02 Sky Lift spec, 03 module contract).

```
events-kit/
  events-hub.js     scheduler: one presentation at a time, three hooks (level result, post-win hop, home arrival)
  sky-lift.js       Sky Lift event (state, rules, screen, claim popup, home tile, lose warning)
  sky-lift.css      styles, prefixed sk*; fonts fall back to the host's --fd / --fu
  art/skylift/      balloon, banner, chests, platform, mast, clouds, backdrop (WebP from Bookshelf v12)
```

## Integrating into a game (what Size Match v51 does)

```html
<link rel="stylesheet" href="../events-kit/sky-lift.css">
<script src="../events-kit/events-hub.js"></script>
<script src="../events-kit/sky-lift.js"></script>
```

```js
const SKY = SkyLift.init({
  root: phoneEl,                                   // the screen and popups mount here
  load: () => prog.sky || null,                    // the event state is one JSON object
  save: k => { prog.sky = k; saveProg(); },
  playerLevel: () => prog.level + 1,               // 1-based current level (unlock check)
  grant: r => { /* coins / booster / lives */ },   // apply a reward
  rewardIcon: r => html,                           // optional: host art for icons
  rewardLabel: r => text,                          // optional
  onPlay: () => playLevel(prog.level),             // PLAY on the event screen (from Home)
  sound: name => {},                               // optional
  cfg: { unlockLevel: 2, seasonDays: 3, milestones: [...], rewards: [...], track: (name, params) => {} }
});
EventsHub.register(SKY);
SKY.mountTile(homeButtonEl);                       // the Home button (hidden while locked)
```

Game hooks (the only places the game knows about events):

| moment | call |
|---|---|
| level won / lost | `EventsHub.levelResult(won, levelNumber, firstClear)` |
| NEXT on the win screen | `EventsHub.wonHop(() => nextLevel(), () => goHome())` — a pending milestone shows the event first |
| arriving on Home | `EventsHub.homeShow()` — one pending presentation per arrival (enter prompt, unclaimed milestone) |
| lose popup | `EventsHub.loseWarnings()[0]?.html` — what the player is about to lose |
| Home refresh | `EventsHub.refresh()` — re-renders the event tiles |

Reward types: `{type:'coins',n}`, `{type:'booster',id,n}`, `{type:'lives',min}` (unlimited lives for N minutes). A milestone may hold a bundle (array).

## Sky Lift rules (as implemented)
- Unlocks when the player reaches `unlockLevel`; the unlocking win is not counted. Personal season of `seasonDays`, then a reset (flights are kept).
- Every first clear lifts the balloon one floor (`countReplays:false`); a loss (fail popup → replay / give up, or leaving the level) drops it to the last reached milestone, never lower.
- Milestones are persisted (`pending`) until claimed; the claim popup grants the rewards. Every milestone is presented automatically: on NEXT after the win, or on Home if the player left the win screen another way.
- Floor 60 (grand prize) completes a flight: rewards, `flights++`, balloon back to 0.
- Cheats: `SKY.cheat.setFloor(n)`, `SKY.cheat.endSeason()`, `SKY.reset()`. Analytics via `cfg.track`: `sky_lift_unlock / milestone / drop / open / claim / flight / season_reset`.

Verified with `proto-size-match/verify_v51.mjs` (headless Chrome + CDP, real taps).
