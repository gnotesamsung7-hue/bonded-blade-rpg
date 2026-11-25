export function nextTurn(queue) {
  if (!queue.length) return null;
  const [current, ...rest] = queue;
  return { current, nextQueue: [...rest, current] };
}
