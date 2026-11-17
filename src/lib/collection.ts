import { useCallback, useEffect, useState } from 'react';
import { type CreatureId, isCreatureId } from '../data/creatures';

const KEY = 'carokarty_zbierka_v1';

function read(): CreatureId[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((v): v is CreatureId => typeof v === 'string' && isCreatureId(v)) : [];
  } catch {
    return [];
  }
}

/** Zbierka bytostí uložená v telefóne (localStorage). */
export function useCollection() {
  const [owned, setOwned] = useState<CreatureId[]>(read);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(owned));
    } catch {
      // súkromný režim — zbierka vydrží aspoň do zatvorenia
    }
  }, [owned]);

  const add = useCallback((id: CreatureId) => {
    setOwned((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const has = useCallback((id: CreatureId) => owned.includes(id), [owned]);

  return { owned, add, has };
}

/** Z textu QR kódu vytiahne id bytosti. Prijme odkaz „…#/c/drak“ aj „carokarty:drak“. */
export function parseCardPayload(text: string): CreatureId | null {
  const match = text.match(/#\/c\/([a-z]+)/i) ?? text.match(/^carokarty:([a-z]+)$/i);
  const id = match?.[1]?.toLowerCase();
  return id && isCreatureId(id) ? id : null;
}

/** Odkaz, ktorý sa zakóduje do QR na karte — dá sa naskenovať aj obyčajným fotoaparátom. */
export function cardUrl(id: CreatureId): string {
  return `${location.origin}${location.pathname}#/c/${id}`;
}
