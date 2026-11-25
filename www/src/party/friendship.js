import { MAX_PARTY_SIZE } from '../core/state.js';

export function adjustBond(currentBond, delta) {
  return Math.max(0, Math.min(100, currentBond + delta));
}

export function canTriggerSoulForgedBlade(bond, partySize) {
  return bond >= 50 && partySize >= 2;
}

export function canTriggerFullBondStorm(bond, partySize) {
  return bond >= 80 && partySize >= MAX_PARTY_SIZE;
}
