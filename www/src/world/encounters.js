import { MAX_PARTY_SIZE } from '../core/state.js';
import { GEMS } from '../gear/gems.js';

export function resolveTileEvent(tileCode, state) {
  const gemNode = state.gemNodes.find(
    (node) => !node.collected && node.x === state.player.x && node.y === state.player.y
  );
  if (gemNode) {
    return { type: 'GEM_NODE', gemId: gemNode.gemId };
  }

  const unrecruited = state.recruitables.find(
    (npc) => !npc.recruited && npc.x === state.player.x && npc.y === state.player.y
  );

  if (unrecruited) {
    if (state.party.length >= MAX_PARTY_SIZE) {
      return { type: 'PARTY_FULL', npcKey: unrecruited.key };
    }
    return {
      type: 'RECRUIT_ALLY',
      allyKey: unrecruited.key,
      bondDelta: unrecruited.bondDelta
    };
  }

  if (tileCode === 2) {
    return { type: 'SHRINE', bondDelta: 15 };
  }

  if (tileCode === 3 && state.enemy.hp > 0) {
    return { type: 'BOSS', enemyId: 'elder_shadow_golem' };
  }

  return { type: 'NONE' };
}

export function describeGem(gemId) {
  const g = GEMS[gemId];
  return g ? `${g.symbol} ${g.name}` : 'Elemental Gem';
}
