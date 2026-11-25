# Chronicles of the Bonded Blade — Project Rules

## Architecture & Scope
- Theme: Magic, weapons, and friendship synergy in a turn-based/overworld RPG.
- Keep state updates isolated in `src/core/state.js` and main frame/turn orchestration in `src/core/gameLoop.js`.
- Keep party stats and bond calculations inside `src/party/` (`characters.js`, `friendship.js`).
- Keep combat formulas and turn order inside `src/combat/` (`turnManager.js`, `damageCalc.js`).
- Keep map tiles, shrines, and encounter triggers inside `src/world/` (`tilemap.js`, `encounters.js`).

## Mobile & APK Delivery
- Ensure touch controls and responsive layout work cleanly on mobile viewports (such as Galaxy S24 FE).
- Whenever producing or updating an Android APK build, always include a scannable QR code and step-by-step Android install notes.
