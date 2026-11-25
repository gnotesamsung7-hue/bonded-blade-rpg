export const BOSS_PHASES = [
  {
    phase: 1,
    name: 'Stonebound Sentinel',
    minHp: 185,
    weakness: 'earth',
    resistance: 'wind',
    atkBonus: 0,
    attackName: 'Tectonic Slam',
    entryLog: 'Phase I — Stonebound Sentinel: Stone armor is weak to EARTH (🪨 Aegis Topaz) and resists WIND (🌪️ Gale Jade).'
  },
  {
    phase: 2,
    name: 'Cinder-Core Awakening',
    minHp: 90,
    weakness: 'fire',
    resistance: 'earth',
    atkBonus: 3,
    attackName: 'Magma Crush',
    entryLog: 'Phase II — Cinder-Core Awakening! Molten veins flare—weak to FIRE (🔥 Ignis Ruby), resistant to EARTH (🪨 Aegis Topaz).'
  },
  {
    phase: 3,
    name: 'Rift Sovereign',
    minHp: 0,
    weakness: 'astral',
    resistance: 'fire',
    atkBonus: 6,
    attackName: 'Rift Cataclysm',
    entryLog: 'Phase III — RIFT SOVEREIGN! Shadow surges—weak to ASTRAL (💎 Astral Sapphire), resistant to FIRE (🔥 Ignis Ruby)!'
  }
];

export function getBossPhase(enemyHp, maxHp = 280) {
  const ratio = maxHp > 0 ? enemyHp / maxHp : 0;
  const scaledHp = Math.ceil(ratio * 280);
  if (enemyHp >= 185 || scaledHp >= 185) return BOSS_PHASES[0];
  if (enemyHp >= 90 || scaledHp >= 90) return BOSS_PHASES[1];
  return BOSS_PHASES[2];
}

export function getElementalMultiplier(element, phaseObj) {
  if (!element || !phaseObj) return { mult: 1, label: 'neutral' };
  if (element === phaseObj.weakness) return { mult: 1.5, label: 'WEAKNESS x1.5' };
  if (element === phaseObj.resistance) return { mult: 0.65, label: 'RESIST x0.65' };
  return { mult: 1, label: 'neutral' };
}
