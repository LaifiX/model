export type CreatureId = 'drak' | 'vila' | 'skriatok' | 'vodnik';
export type Rarity = 'bežná' | 'vzácna' | 'legendárna';

export interface Creature {
  id: CreatureId;
  name: string;
  title: string;
  rarity: Rarity;
  /** Hlavná farba bytosti — použije sa na karte a v detaile */
  color: string;
  habitat: string;
  size: string;
  food: string;
  traits: string[];
  abilities: string[];
  story: string[];
  funFact: string;
  stats: { label: string; value: number }[];
}

export const CREATURES: Creature[] = [
  {
    id: 'drak',
    name: 'Drak Iskrík',
    title: 'Malý ohnivý drak',
    rarity: 'legendárna',
    color: '#e8613c',
    habitat: 'Jaskyne pod sopečnými vrchmi, kde je teplo aj v zime',
    size: 'Ako veľký pes, s rozpätím krídel dva metre',
    food: 'Pečené gaštany, uhlíky z ohniska a horúci čaj',
    traits: ['zvedavý', 'trochu chvastavý', 'verný'],
    abilities: ['Fúka iskry namiesto ohňa', 'Zohreje celú izbu za minútu', 'Vidí potme ako za dňa'],
    story: [
      'Iskrík sa vyliahol z vajca, ktoré sto rokov ležalo v pahrebe starej kováčskej vyhne. Keď prvý raz kýchol, zapálil kováčovi fúzy — odvtedy sa učí ovládať svoj oheň.',
      'Zatiaľ to vie len na malé iskry, ale má ich rád ukazovať. Kto mu donesie pečený gaštan, toho večer odprevadí domov a posvieti mu na cestu.',
    ],
    funFact: 'Keď sa Iskrík hanbí, z nozdier mu namiesto iskier vyletí mydlová bublina.',
    stats: [
      { label: 'Čarovná sila', value: 4 },
      { label: 'Odvaha', value: 5 },
      { label: 'Huncútstvo', value: 3 },
      { label: 'Dobrota', value: 4 },
    ],
  },
  {
    id: 'vila',
    name: 'Víla Rosička',
    title: 'Lúčna víla rannej rosy',
    rarity: 'vzácna',
    color: '#f08bb8',
    habitat: 'Rozkvitnuté lúky, najradšej pri zvončekoch a margarétkach',
    size: 'Menšia ako dlaň, krídla má ako lístky ruže',
    food: 'Nektár, kvapky rosy a peľ z ďatelinky',
    traits: ['veselá', 'ranostajka', 'pomáha slabším'],
    abilities: ['Prútikom prebúdza kvety', 'Vie sa zmenšiť na veľkosť kvapky', 'Rozpráva sa s motýľmi'],
    story: [
      'Každé ráno, kým slnko vykukne spoza kopca, Rosička obletí celú lúku a na každý lístok položí jednu kvapku rosy. Preto sa tráva ráno tak trbliece.',
      'Ak nájdeš kvet, ktorý zvesil hlávku, stačí pošepkať jej meno. Rosička priletí, ťukne prútikom a kvet sa znova vystrie k slnku.',
    ],
    funFact: 'Krídla Rosičky zvonia ako maličký zvonček — počuť ich len v úplnom tichu.',
    stats: [
      { label: 'Čarovná sila', value: 5 },
      { label: 'Odvaha', value: 2 },
      { label: 'Huncútstvo', value: 2 },
      { label: 'Dobrota', value: 5 },
    ],
  },
  {
    id: 'skriatok',
    name: 'Škriatok Machuľa',
    title: 'Lesný strážca hríbov',
    rarity: 'bežná',
    color: '#5e8c3a',
    habitat: 'Pod koreňmi starých bukov, v nore vystlanej machom',
    size: 'Siaha ti asi po koleno',
    food: 'Lesné jahody, orechy a hríbová polievka',
    traits: ['huncút', 'pracovitý', 'nevie udržať tajomstvo'],
    abilities: ['Pozná každý chodník v lese', 'Nájde stratené veci', 'Zmizne, keď kýchne'],
    story: [
      'Machuľa stráži hríby v celom lese. Kto ich trhá s úctou a necháva malé, tomu ráno ukáže, kde rastú tie najkrajšie.',
      'Najradšej však robí huncútstva — schováva turistom ponožky a čiapky a potom ich vešia na konáre ako vianočné ozdoby.',
    ],
    funFact: 'Machuľova čiapka je v skutočnosti kúsok machu, ktorý mu na hlave rastie už tristo rokov.',
    stats: [
      { label: 'Čarovná sila', value: 2 },
      { label: 'Odvaha', value: 3 },
      { label: 'Huncútstvo', value: 5 },
      { label: 'Dobrota', value: 3 },
    ],
  },
  {
    id: 'vodnik',
    name: 'Vodník Bublinka',
    title: 'Pán mlynského náhonu',
    rarity: 'vzácna',
    color: '#3f9a8c',
    habitat: 'Tichý rybník pri starom mlyne, medzi leknami a trstinou',
    size: 'Ako malý dedko, ale s blanami medzi prstami',
    food: 'Čaj z lekien, kôpor a vlastnoručne pražené orechy',
    traits: ['múdry', 'trochu mrzutý', 'zberateľ hrnčekov'],
    abilities: ['Dýcha pod vodou', 'Predpovie dážď dva dni vopred', 'Fajkou fúka bubliny namiesto dymu'],
    story: [
      'Bublinka býva v rybníku pri mlyne už tak dlho, že pamätá, keď sa koleso točilo po prvý raz. Z kabáta mu stále kvapká voda, aj keď sedí na slnku.',
      'Zbiera hrnčeky — má ich v podvodnej komore stovky, každý z inej dediny. Kto mu daruje hrnček s kvietkom, tomu vraj nikdy nezmokne bielizeň.',
    ],
    funFact: 'Keď je Bublinka dobre naladený, bubliny z jeho fajky majú tvar rybičiek.',
    stats: [
      { label: 'Čarovná sila', value: 4 },
      { label: 'Odvaha', value: 3 },
      { label: 'Huncútstvo', value: 2 },
      { label: 'Dobrota', value: 4 },
    ],
  },
];

export const CREATURE_BY_ID: Record<CreatureId, Creature> = Object.fromEntries(
  CREATURES.map((c) => [c.id, c])
) as Record<CreatureId, Creature>;

export function isCreatureId(value: string): value is CreatureId {
  return value in CREATURE_BY_ID;
}
