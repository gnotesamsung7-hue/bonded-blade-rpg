export const ROSTER = {
  alden: {
    id: 'alden',
    name: 'Alden',
    role: 'Blade Knight',
    weapon: 'Sunsteel Sword',
    hp: 75,
    maxHp: 75,
    mp: 20,
    atk: 17,
    type: 'weapon',
    color: '#4cc9f0',
    quote: 'Steel and trust keep our line unbroken.'
  },
  lyra: {
    id: 'lyra',
    name: 'Lyra',
    role: 'Astral Mage',
    weapon: 'Starlight Staff',
    hp: 55,
    maxHp: 55,
    mp: 35,
    atk: 21,
    type: 'magic',
    color: '#c77dff',
    quote: 'My starfire will temper your blade, Alden!'
  },
  kael: {
    id: 'kael',
    name: 'Kael',
    role: 'Gale Ranger',
    weapon: 'Windshot Bow',
    hp: 65,
    maxHp: 65,
    mp: 25,
    atk: 19,
    type: 'weapon',
    color: '#52b788',
    quote: 'I have the wind lanes covered from afar.'
  },
  talia: {
    id: 'talia',
    name: 'Talia',
    role: 'Aegis Warden',
    weapon: 'Runic Mace',
    hp: 85,
    maxHp: 85,
    mp: 30,
    atk: 15,
    type: 'magic',
    color: '#f4a261',
    quote: 'Stand strong—our bond shields everyone!'
  },
  vex: {
    id: 'vex',
    name: 'Vex',
    role: 'Shadow Weaver',
    weapon: 'Void Dagger',
    hp: 60,
    maxHp: 60,
    mp: 35,
    atk: 22,
    type: 'magic',
    color: '#48cae4',
    quote: 'From the rift edge, I strike where shadows weaken.'
  }
};

export function createPartyMember(rosterKey) {
  const base = ROSTER[rosterKey];
  if (!base) return null;
  return { ...base };
}
