# Čarokarty

Naskenuj čarovnú kartu telefónom a zjaví sa ti rozprávková bytosť v 3D. Tlačidlom **Stiahnuť do zbierky** si ju uložíš do aplikácie, kde sa o nej dozvieš viac a môžeš si ju pozrieť v 3D aj v 2D.

## Ako to vyskúšať na telefóne

1. Dvakrát klikni na **`Spustit-Carokarty.bat`**.
2. V okne sa vypíše adresa **`Network: https://192.168.x.x:5180/`**. Otvor ju v telefóne. Telefón musí byť na **rovnakej Wi-Fi** ako počítač.
3. Prehliadač upozorní na „nezabezpečený certifikát“. Je to lokálny certifikát z tvojho počítača, takže daj **Rozšírené → Pokračovať na stránku**. Kamera v prehliadači funguje len cez `https`, preto je to potrebné.
4. Povoľ prístup ku kamere.
5. Na počítači otvor záložku **Karty**, prípadne si ich vytlač, a QR kód naskenuj telefónom.

QR kód sa dá naskenovať aj obyčajným fotoaparátom v telefóne. Otvorí rovno zjavenie bytosti.

Bez kamery: na stránke **Karty** je pri každej karte odkaz **Vyskúšať bez kamery**.

## Čo aplikácia obsahuje

- **Skenovať:** živý obraz z kamery, hľadanie QR kódu a bytosť, ktorá sa v 3D zjaví nad obrazom.
- **Zbierka:** získané bytosti ako zberateľské karty. Neobjavené sú len tiene s otáznikom.
- **Detail bytosti:** prepínač 3D/2D (v 3D sa dá model otáčať a približovať prstami), príbeh, vlastnosti, schopnosti a zaujímavosť.
- **Karty:** 4 čarovné karty s QR kódmi pripravené na tlač.

Bytosti: Drak Iskrík, Víla Rosička, Škriatok Machuľa a Vodník Bublinka.

Zbierka sa ukladá priamo v telefóne, v prehliadači.

## Pre vývoj

```bash
npm run dev      # vývojový server (https, dostupný v sieti)
npm run build    # produkčná verzia do priečinka dist
```

- 3D modely sú poskladané v kóde z tvarov (three.js / React Three Fiber): `src/three/models.tsx`
- 2D ilustrácie sú SVG: `src/art/CreatureArt.tsx`
- Texty o bytostiach: `src/data/creatures.ts`

Novú bytosť pridáš tak, že doplníš záznam do `creatures.ts`, model do `models.tsx` a ilustráciu do `CreatureArt.tsx`.

## Nápady na ďalšie kroky

- Rozpoznávanie samotného obrázka namiesto QR (napr. MindAR) a bytosť postavená priamo na karte.
- Pravá AR: postaviť bytosť na stôl cez Scene Viewer / Quick Look.
- Zverejnenie na Netlify, aby fungovala kdekoľvek bez spúšťania počítača (`netlify.toml` je pripravený).
