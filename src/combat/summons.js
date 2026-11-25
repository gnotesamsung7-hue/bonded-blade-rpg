export const SUMMONS = {
  solarix: {
    id: 'solarix',
    name: 'Solarix, Crest Drake',
    icon: '🐉',
    bondCost: 40,
    minParty: 1,
    minBond: 40,
    damage: 42,
    healAll: 8,
    mpAll: 0,
    shieldNextHit: 4,
    bondGainAfter: 5,
    desc: '42 Flame DMG, +8 HP & +4 Guard (Req: 40% Bond)'
  },
  aurelia: {
    id: 'aurelia',
    name: 'Aurelia, Starlight Seraph',
    icon: '👼',
    bondCost: 50,
    minParty: 2,
    minBond: 50,
    damage: 54,
    healAll: 22,
    mpAll: 10,
    shieldNextHit: 8,
    bondGainAfter: 5,
    desc: '54 Astral DMG, +22 HP, +10 MP, +8 Guard (Req: 50% Bond, 2+ Allies)'
  },
  leviathan: {
    id: 'leviathan',
    name: 'Oathbound Leviathan',
    icon: '🌊',
    bondCost: 70,
    minParty: 4,
    minBond: 70,
    damage: 95,
    healAll: 28,
    mpAll: 12,
    shieldNextHit: 12,
    bondGainAfter: 10,
    desc: '95 Tide DMG, +28 HP, +12 MP, +12 Guard (Req: 70% Bond, 4+ Allies)'
  }
};

export function canInvokeSummon(summon, bond, partySize) {
  if (!summon) return false;
  return bond >= summon.minBond && bond >= summon.bondCost && partySize >= summon.minParty;
}
