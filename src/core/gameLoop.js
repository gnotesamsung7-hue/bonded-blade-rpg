import { cloneState, MAX_PARTY_SIZE } from './state.js';
import { createPartyMember } from '../party/characters.js';
import {
  adjustBond,
  canTriggerSoulForgedBlade,
  canTriggerFullBondStorm
} from '../party/friendship.js';
import { nextTurn } from '../combat/turnManager.js';
import {
  calcPhysicalDamage,
  calcMagicDamage,
  calcBondDamageReduction
} from '../combat/damageCalc.js';
import { getBossPhase, getElementalMultiplier } from '../combat/bossAI.js';
import { SUMMONS, canInvokeSummon } from '../combat/summons.js';
import { GEMS, slotGemOnMember } from '../gear/gems.js';
import { STARTER_MAP, isWalkable } from '../world/tilemap.js';
import { resolveTileEvent } from '../world/encounters.js';
import { STORY } from '../world/story.js';

export function stepFrame(state, _dt = 0) {
  return {
    state,
    canCombo: canTriggerSoulForgedBlade(state.bond, state.party.length),
    canBondStorm: canTriggerFullBondStorm(state.bond, state.party.length)
  };
}

export function equipGemAction(prevState, memberId, gemId) {
  const next = cloneState(prevState);
  const res = slotGemOnMember(next, memberId, gemId);
  if (!res.ok) {
    return { state: prevState, message: res.message };
  }
  next.selectedMemberId = memberId;
  next.selectedGemId = gemId;
  return { state: next, message: res.message };
}

export function movePlayer(prevState, dx, dy) {
  if (prevState.mode !== 'EXPLORE') {
    return { state: prevState, messages: [] };
  }

  const next = cloneState(prevState);
  const nx = next.player.x + dx;
  const ny = next.player.y + dy;

  if (!isWalkable(STARTER_MAP, nx, ny)) {
    return { state: prevState, messages: [] };
  }

  next.player.x = nx;
  next.player.y = ny;

  const messages = [];
  const tileCode = STARTER_MAP[ny][nx];
  const event = resolveTileEvent(tileCode, next);

  if (event.type === 'GEM_NODE') {
    const node = next.gemNodes.find(
      (n) => !n.collected && n.x === nx && n.y === ny
    );
    const gem = GEMS[event.gemId];
    if (node && gem) {
      node.collected = true;
      next.gemInventory.push(event.gemId);
      next.selectedGemId = event.gemId;
      messages.push(`Found ${gem.symbol} ${gem.name} (${gem.desc})! Added to gem bag.`);
    }
  } else if (event.type === 'RECRUIT_ALLY') {
    const ally = createPartyMember(event.allyKey);
    const npc = next.recruitables.find((item) => item.key === event.allyKey);
    if (ally && npc) {
      npc.recruited = true;
      next.party.push(ally);
      next.turnQueue.splice(Math.max(1, next.turnQueue.length - 1), 0, ally.id);
      next.bond = adjustBond(next.bond, event.bondDelta);
      if (next.party.length >= 3 && next.chapterIndex < 1) {
        next.chapterIndex = 1;
        messages.push(`📖 ${STORY.chapters[1].title}: ${STORY.chapters[1].text}`);
      }
      messages.push(
        `${ally.name} (${ally.role}) joined! Party ${next.party.length}/${MAX_PARTY_SIZE} | Bond +${event.bondDelta}%!`
      );
    }
  } else if (event.type === 'PARTY_FULL') {
    messages.push(`Party is already at full strength (${MAX_PARTY_SIZE}/${MAX_PARTY_SIZE})!`);
  } else if (event.type === 'SHRINE') {
    next.bond = adjustBond(next.bond, event.bondDelta);
    messages.push(`Rested at an Oath Shrine! Party Bond +${event.bondDelta}%!`);
  } else if (event.type === 'BOSS') {
    next.mode = 'COMBAT';
    next.chapterIndex = 2;
    const phase = getBossPhase(next.enemy.hp, next.enemy.maxHp);
    next.enemy.phase = phase.phase;
    messages.push(`📖 ${STORY.chapters[2].title}: ${STORY.chapters[2].text}`);
    messages.push(phase.entryLog);
  }

  return { state: next, messages };
}

function applyGemHitEffects(state, gem, messages) {
  if (!gem) return;
  if (gem.bondBonus > 0) {
    state.bond = adjustBond(state.bond, gem.bondBonus);
  }
  if (gem.mpOnHit > 0) {
    state.party.forEach((m) => {
      if (m.hp > 0) {
        m.mp += gem.mpOnHit;
      }
    });
    messages.push(`${gem.symbol} ${gem.name} restores +${gem.mpOnHit} MP to active allies!`);
  }
}

function syncBossPhase(nextState, messages) {
  const updated = getBossPhase(nextState.enemy.hp, nextState.enemy.maxHp);
  if (nextState.enemy.hp > 0 && updated.phase !== nextState.enemy.phase) {
    nextState.enemy.phase = updated.phase;
    messages.push(`⚡ ${updated.entryLog}`);
  }
  return updated;
}

export function performCombatAction(prevState, actionType, summonId = null) {
  if (prevState.mode !== 'COMBAT') {
    return { state: prevState, messages: [], defeat: false };
  }

  const next = cloneState(prevState);
  const messages = [];
  let activePhase = getBossPhase(next.enemy.hp, next.enemy.maxHp);
  next.enemy.phase = activePhase.phase;

  const turnStep = nextTurn(next.turnQueue);
  if (turnStep) {
    next.turnQueue = turnStep.nextQueue;
  }

  let acted = false;

  if (actionType === 'SLASH') {
    const striker =
      next.party.find((m) => m.id === next.selectedMemberId && m.hp > 0) ||
      next.party.find((m) => m.type === 'weapon' && m.hp > 0) ||
      next.party.find((m) => m.hp > 0);
    const hit = calcPhysicalDamage(striker, Math.floor(Math.random() * 8), activePhase);
    next.enemy.hp = Math.max(0, next.enemy.hp - hit.total);
    next.bond = adjustBond(next.bond, 10);
    const gemTag = hit.gem
      ? ` [${hit.gem.symbol} +${hit.elemDmg} ${hit.gem.element} • ${hit.elemLabel}]`
      : '';
    messages.push(
      `${striker.name} strikes with ${striker.weapon}${gemTag} for ${hit.total} DMG! (+10% Bond)`
    );
    applyGemHitEffects(next, hit.gem, messages);
    acted = true;
  } else if (actionType === 'MAGIC') {
    const caster =
      next.party.find(
        (m) => m.id === next.selectedMemberId && m.type === 'magic' && m.hp > 0
      ) ||
      next.party.find((m) => m.type === 'magic' && m.hp > 0 && m.mp >= 5) ||
      next.party.find((m) => m.type === 'magic' && m.hp > 0);

    if (!caster) {
      messages.push('Recruit a magic ally (Lyra, Talia, or Vex) to cast spells!');
    } else if (caster.mp < 5) {
      messages.push(`${caster.name} does not have enough MP!`);
    } else {
      caster.mp -= 5;
      const hit = calcMagicDamage(caster, Math.floor(Math.random() * 10), activePhase);
      next.enemy.hp = Math.max(0, next.enemy.hp - hit.total);
      next.bond = adjustBond(next.bond, 10);
      const gemTag = hit.gem
        ? ` [${hit.gem.symbol} +${hit.elemDmg} ${hit.elementUsed} • ${hit.elemLabel}]`
        : ` [✨ ${hit.elemLabel}]`;
      messages.push(
        `${caster.name} channels ${caster.weapon}${gemTag} for ${hit.total} MAGIC DMG! (+10% Bond)`
      );
      applyGemHitEffects(next, hit.gem, messages);
      acted = true;
    }
  } else if (actionType === 'CHEER') {
    const bondGain = 15 + next.party.length * 2;
    const healAmt = 10 + next.party.length * 2;
    next.bond = adjustBond(next.bond, bondGain);
    next.party.forEach((member) => {
      if (member.hp > 0) {
        member.hp = Math.min(member.maxHp, member.hp + healAmt);
      }
    });
    messages.push(
      `Party rally restores ${healAmt} HP to active members and boosts Bond by +${bondGain}%!`
    );
    acted = true;
  } else if (actionType === 'SUMMON') {
    const summon = SUMMONS[summonId];
    if (!canInvokeSummon(summon, next.bond, next.party.length)) {
      messages.push(
        `Cannot summon ${summon ? summon.name : 'spirit'}: check Bond % and party size requirement.`
      );
    } else {
      next.bond = adjustBond(next.bond, -summon.bondCost);
      const summonElem = summon.id === 'solarix' ? 'fire' : summon.id === 'aurelia' ? 'astral' : 'wind';
      const elemInfo = getElementalMultiplier(summonElem, activePhase);
      const scaledDmg = Math.round(summon.damage * elemInfo.mult);
      next.enemy.hp = Math.max(0, next.enemy.hp - scaledDmg);
      next.tempShield += summon.shieldNextHit;
      next.party.forEach((member) => {
        if (member.hp > 0) {
          member.hp = Math.min(member.maxHp, member.hp + summon.healAll);
          member.mp += summon.mpAll;
        }
      });
      messages.push(
        `${summon.icon} SUMMONED ${summon.name.toUpperCase()}! ${scaledDmg} DMG (${elemInfo.label}), +${summon.healAll} HP, +${summon.shieldNextHit} Guard!`
      );
      if (summon.bondGainAfter > 0) {
        next.bond = adjustBond(next.bond, summon.bondGainAfter);
      }
      acted = true;
    }
  } else if (actionType === 'COMBO') {
    if (!canTriggerSoulForgedBlade(next.bond, next.party.length)) {
      messages.push('Requires at least 50% Bond and 2+ party members!');
    } else {
      next.bond = adjustBond(next.bond, -50);
      const dmg = 65 + next.party.length * 10;
      next.enemy.hp = Math.max(0, next.enemy.hp - dmg);
      messages.push(
        `✨ SOUL-FORGED BLADE: The party fuses weapons & magic for ${dmg} DMG!`
      );
      acted = true;
    }
  } else if (actionType === 'BOND_STORM') {
    if (!canTriggerFullBondStorm(next.bond, next.party.length)) {
      messages.push(`Requires ${MAX_PARTY_SIZE}/5 party members and 80%+ Bond!`);
    } else {
      next.bond = adjustBond(next.bond, -80);
      const dmg = 155;
      next.enemy.hp = Math.max(0, next.enemy.hp - dmg);
      next.party.forEach((member) => {
        member.hp = Math.min(member.maxHp, member.hp + 20);
      });
      messages.push(
        `🌟 FIVE-FOLD BOND STORM: All 5 allies strike as one for ${dmg} DEVASTATING DMG & +20 HP heal!`
      );
      acted = true;
    }
  }

  if (!acted) {
    return { state: next, messages, defeat: false };
  }

  if (next.enemy.hp <= 0) {
    next.mode = 'VICTORY';
    messages.push(`The ${next.enemy.name} falls! ${STORY.epilogue}`);
    return { state: next, messages, defeat: false };
  }

  activePhase = syncBossPhase(next, messages);

  const aliveParty = next.party.filter((member) => member.hp > 0);
  const target = aliveParty[Math.floor(Math.random() * aliveParty.length)];
  const reduction = calcBondDamageReduction(
    next.bond,
    aliveParty.length,
    next.party,
    next.tempShield
  );
  next.tempShield = 0;
  const phaseAtk = next.enemy.atk + activePhase.atkBonus;
  const enemyDmg = Math.max(3, phaseAtk - reduction);
  target.hp = Math.max(0, target.hp - enemyDmg);
  messages.push(
    `${next.enemy.name} (${activePhase.name}) uses ${activePhase.attackName} on ${target.name} for ${enemyDmg} DMG (-${reduction} guard).`
  );

  const defeat = next.party.every((member) => member.hp <= 0);
  if (defeat) {
    messages.push('Party defeated! Reloading...');
  }

  return { state: next, messages, defeat };
}
