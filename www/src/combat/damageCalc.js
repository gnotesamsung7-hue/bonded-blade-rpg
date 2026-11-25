import { GEMS, getMemberEffectiveAtk } from '../gear/gems.js';
import { getElementalMultiplier } from './bossAI.js';

export function calcPhysicalDamage(memberOrAtk, variance = 0, bossPhase = null) {
  if (typeof memberOrAtk === 'object' && memberOrAtk !== null) {
    const baseAtk = getMemberEffectiveAtk(memberOrAtk);
    const gem = memberOrAtk.slottedGem ? GEMS[memberOrAtk.slottedGem] : null;
    const elemInfo = gem ? getElementalMultiplier(gem.element, bossPhase) : { mult: 1, label: 'neutral' };
    const rawElem = gem ? gem.elementDmg * elemInfo.mult : 0;
    const elemDmg = Math.round(rawElem);
    const total = Math.max(1, Math.round(baseAtk + variance + rawElem));
    return {
      total,
      elemDmg,
      gem,
      elemLabel: elemInfo.label
    };
  }
  const total = Math.max(1, memberOrAtk + variance);
  return { total, elemDmg: 0, gem: null, elemLabel: 'neutral' };
}

export function calcMagicDamage(memberOrAtk, variance = 0, bossPhase = null) {
  if (typeof memberOrAtk === 'object' && memberOrAtk !== null) {
    const baseAtk = getMemberEffectiveAtk(memberOrAtk);
    const gem = memberOrAtk.slottedGem ? GEMS[memberOrAtk.slottedGem] : null;
    const effectiveElement = gem ? gem.element : 'astral';
    const elemInfo = getElementalMultiplier(effectiveElement, bossPhase);
    const baseSpell = gem ? Math.round(gem.elementDmg * 1.25) : 6;
    const elemDmg = Math.round(baseSpell * elemInfo.mult);
    const total = Math.max(1, Math.round(baseAtk + variance + elemDmg));
    return {
      total,
      elemDmg,
      gem,
      elementUsed: effectiveElement,
      elemLabel: elemInfo.label
    };
  }
  const total = Math.max(1, memberOrAtk + variance);
  return { total, elemDmg: 0, gem: null, elementUsed: null, elemLabel: 'neutral' };
}

export function calcBondDamageReduction(bond, partySize = 1, party = [], tempShield = 0) {
  const bondBonus = Math.floor(bond / 20);
  const partyBonus = Math.max(0, partySize - 1);
  const gemGuard = party.reduce((sum, member) => {
    if (member.hp <= 0 || !member.slottedGem) return sum;
    const gem = GEMS[member.slottedGem];
    return sum + (gem ? gem.guardBonus : 0);
  }, 0);
  return bondBonus + partyBonus + gemGuard + tempShield;
}
