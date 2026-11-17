import { useEffect, useState } from 'react';
import { Cards } from './components/Cards';
import { Collection } from './components/Collection';
import { Detail } from './components/Detail';
import { RevealView } from './components/RevealView';
import { Scanner } from './components/Scanner';
import { type CreatureId, isCreatureId } from './data/creatures';
import { useCollection } from './lib/collection';

type Route =
  | { name: 'scan' }
  | { name: 'collection' }
  | { name: 'cards' }
  | { name: 'detail'; id: CreatureId }
  | { name: 'reveal'; id: CreatureId };

function parseRoute(hash: string): Route {
  const [, section, arg] = hash.replace(/^#/, '').split('/');
  if (section === 'zbierka') return { name: 'collection' };
  if (section === 'karty') return { name: 'cards' };
  if (section === 'bytost' && arg && isCreatureId(arg)) return { name: 'detail', id: arg };
  if (section === 'c' && arg && isCreatureId(arg)) return { name: 'reveal', id: arg };
  return { name: 'scan' };
}

function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(location.hash));
  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

const go = (hash: string) => {
  location.hash = hash;
};

export function App() {
  const route = useRoute();
  const { owned, add, has } = useCollection();
  const fullScreen = route.name === 'scan' || route.name === 'reveal';

  return (
    <div className={`app ${fullScreen ? 'is-fullscreen' : ''}`}>
      <main className="app-main">
        {route.name === 'scan' && (
          <Scanner has={has} onCatch={add} onOpen={(id) => go(`#/bytost/${id}`)} />
        )}
        {route.name === 'reveal' && (
          <RevealView
            key={route.id}
            id={route.id}
            owned={has(route.id)}
            onCatch={add}
            onOpen={(id) => go(`#/bytost/${id}`)}
            onScanAgain={() => go('#/skenovat')}
          />
        )}
        {route.name === 'collection' && <Collection owned={owned} />}
        {route.name === 'detail' && <Detail key={route.id} id={route.id} />}
        {route.name === 'cards' && <Cards />}
      </main>

      <nav className="tabbar no-print" aria-label="Hlavná navigácia">
        <a href="#/skenovat" aria-current={route.name === 'scan' || route.name === 'reveal' ? 'page' : undefined}>
          <ScanIcon />
          <span>Skenovať</span>
        </a>
        <a
          href="#/zbierka"
          aria-current={route.name === 'collection' || route.name === 'detail' ? 'page' : undefined}
        >
          <BookIcon />
          <span>Zbierka</span>
          {owned.length > 0 && <span className="tab-count">{owned.length}</span>}
        </a>
        <a href="#/karty" aria-current={route.name === 'cards' ? 'page' : undefined}>
          <CardIcon />
          <span>Karty</span>
        </a>
      </nav>
    </div>
  );
}

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function ScanIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M12 8.5l1.1 2.3 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg {...iconProps}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 15h2v2H9zM13 15h2v2h-2zM9 7h6v5H9z" />
    </svg>
  );
}
