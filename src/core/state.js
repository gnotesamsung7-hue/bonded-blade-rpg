export const MAX_PARTY_SIZE = 5;

export const initialState = {
  mode: 'EXPLORE', // EXPLORE | COMBAT | VICTORY
  chapterIndex: 0,
  player: { x: 1, y: 1 },
  selectedMemberId: 'alden',
  selectedGemId: 'ignis_ruby',
  gemInventory: [
    'ignis_ruby',
    'gale_jade',
    'astral_sapphire',
    'aegis_topaz',
    'ignis_ruby'
  ],
  gemNodes: [
    { x: 5, y: 1, gemId: 'astral_sapphire', collected: false, color: '#4895ef' },
    { x: 9, y: 8, gemId: 'aegis_topaz', collected: false, color: '#f9c74f' },
    { x: 13, y: 9, gemId: 'gale_jade', collected: false, color: '#90be6d' }
  ],
  recruitables: [
    { key: 'lyra', x: 2, y: 8, recruited: false, color: '#c77dff', bondDelta: 15 },
    { key: 'kael', x: 3, y: 3, recruited: false, color: '#52b788', bondDelta: 15 },
    { key: 'talia', x: 12, y: 4, recruited: false, color: '#f4a261', bondDelta: 15 },
    { key: 'vex', x: 10, y: 1, recruited: false, color: '#48cae4', bondDelta: 20 }
  ],
  enemy: { name: 'Elder Shadow Golem', hp: 280, maxHp: 280, atk: 19, phase: 1 },
  tempShield: 0,
  bond: 30,
  turnQueue: ['alden', 'enemy'],
  party: [
    {
      id: 'alden',
      name: 'Alden',
      role: 'Blade Knight',
      weapon: 'Sunsteel Sword',
      slottedGem: 'ignis_ruby',
      hp: 80,
      maxHp: 80,
      mp: 20,
      atk: 17,
      type: 'weapon',
      color: '#4cc9f0'
    }
  ]
};

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
