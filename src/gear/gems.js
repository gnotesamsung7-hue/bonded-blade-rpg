export const GEMS = {
  ignis_ruby: {
    id: 'ignis_ruby',
    name: 'Ignis Ruby',
    element: 'fire',
    symbol: '🔥',
    atkBonus: 6,
    elementDmg: 6,
    bondBonus: 2,
    mpOnHit: 0,
    guardBonus: 0,
    desc: '+6 ATK, +6 Fire DMG, +2% Bond/hit'
  },
  gale_jade: {
    id: 'gale_jade',
    name: 'Gale Jade',
    element: 'wind',
    symbol: '🌪️',
    atkBonus: 5,
    elementDmg: 4,
    bondBonus: 0,
    mpOnHit: 0,
    guardBonus: 2,
    desc: '+5 ATK, +4 Wind DMG, +2 Guard'
  },
  astral_sapphire: {
    id: 'astral_sapphire',
    name: 'Astral Sapphire',
    element: 'astral',
    symbol: '💎',
    atkBonus: 7,
    elementDmg: 8,
    bondBonus: 0,
    mpOnHit: 2,
    guardBonus: 0,
    desc: '+7 ATK, +8 Astral DMG, +2 MP/hit'
  },
  aegis_topaz: {
    id: 'aegis_topaz',
    name: 'Aegis Topaz',
    element: 'earth',
    symbol: '🪨',
    atkBonus: 4,
    elementDmg: 5,
    bondBonus: 1,
    mpOnHit: 0,
    guardBonus: 4,
    desc: '+4 ATK, +5 Earth DMG, +4 Guard'
  }
};

export function slotGemOnMember(state, memberId, gemId) {
  const gem = GEMS[gemId];
  const member = state.party.find((m) => m.id === memberId);
  if (!gem || !member) {
    return { ok: false, message: 'Invalid party member or gem.' };
  }

  const invIndex = state.gemInventory.indexOf(gemId);
  if (invIndex === -1) {
    return { ok: false, message: `No ${gem.name} left in bag.` };
  }

  state.gemInventory.splice(invIndex, 1);
  if (member.slottedGem) {
    state.gemInventory.push(member.slottedGem);
  }

  member.slottedGem = gemId;
  return {
    ok: true,
    message: `Slotted ${gem.symbol} ${gem.name} into ${member.name}'s ${member.weapon}!`
  };
}

export function getMemberEffectiveAtk(member) {
  const gem = member.slottedGem ? GEMS[member.slottedGem] : null;
  return member.atk + (gem ? gem.atkBonus : 0);
}
