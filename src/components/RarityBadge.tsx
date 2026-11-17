import type { Rarity } from '../data/creatures';

const CLASS: Record<Rarity, string> = {
  bežná: 'rarity-common',
  vzácna: 'rarity-rare',
  legendárna: 'rarity-legend',
};

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span className={`rarity ${CLASS[rarity]}`}>
      <span aria-hidden="true">{rarity === 'legendárna' ? '★★★' : rarity === 'vzácna' ? '★★' : '★'}</span>
      {rarity}
    </span>
  );
}
