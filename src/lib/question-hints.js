// ═══ Question Hints & Diagnostic Explanations ═══

export const FACET_HINTS = {
  "Anhedonie": { hint: "Otázky zjišťují, zda prožíváte radost a potěšení z běžných aktivit.", example: "Např. zda si užíváte jídlo, hudbu, přírodu, setkání s přáteli..." },
  "Úzkostnost": { hint: "Otázky se zaměřují na míru vašich obav, nervozity a starostí.", example: "Např. zda se často obáváte budoucnosti, nemůžete přestat myslet na problémy..." },
  "Vyhášení pozornosti": { hint: "Otázky zjišťují, jak moc chcete být středem pozornosti.", example: "Např. zda rádi upoutáváte ostatní, mluvíte o svých úspěších..." },
  "Bezcitnost": { hint: "Otázky se týkají vaší empatie a zájmu o pocity druhých.", example: "Např. zda vás trápí, když vidíte někoho trpět, nebo jste spíše lhostejní..." },
  "Klamavost": { hint: "Otázky zjišťují tendenci ke lhaní, přetvářce a manipulaci pravdou.", example: "Např. zda si vymýšlíte příběhy, přikrašlujete události, lžete pro výhodu..." },
  "Depresivita": { hint: "Otázky se zaměřují na pocity beznaděje, bezcennosti a smutku.", example: "Např. zda se cítíte zbytečný/á, máte pocit, že za nic nestojíte..." },
  "Roztříštěnost": { hint: "Otázky zjišťují, jak snadno se rozptýlíte a ztrácíte soustředění.", example: "Např. zda vás snadno vyruší šum, zapomínáte, co jste chtěli říct..." },
  "Excentricita": { hint: "Otázky se týkají neobvyklého chování, myšlení a projevu.", example: "Např. zda vás lidé považují za podivného/podivnou, máte zvláštní zvyky..." },
  "Emoční labilita": { hint: "Otázky zjišťují kolísání nálad a intenzitu emocí.", example: "Např. zda se vaše nálada mění bez důvodu, reagujete přehnaně na maličkosti..." },
  "Grandiozita": { hint: "Otázky se zaměřují na pocity vlastní výjimečnosti a nadřazenosti.", example: "Např. zda se cítíte lepší než ostatní, zasloužíte si zvláštní zacházení..." },
  "Hostilita": { hint: "Otázky zjišťují míru podrážděnosti, hněvu a agresivity.", example: "Např. zda se snadno rozčílíte, máte tendenci reagovat agresivně na kritiku..." },
  "Impulzivita": { hint: "Otázky se týkají jednání bez rozmyslu a sebeovládání.", example: "Např. zda děláte věci bezhlavě, říkáte, co vás napadne, bez přemýšlení..." },
  "Vyhýbání se intimitě": { hint: "Otázky zjišťují, zda se vyhýbáte blízkým vztahům.", example: "Např. zda preferujete být sám/sama, nechcete se nikomu příliš přibližovat..." },
  "Nezodpovědnost": { hint: "Otázky se zaměřují na spolehlivost a plnění závazků.", example: "Např. zda prošvihujete schůzky, zapomínáte platit účty, nedotahujete věci..." },
  "Manipulativnost": { hint: "Otázky zjišťují tendenci ovlivňovat ostatní pro vlastní prospěch.", example: "Např. zda používáte lichocení, svádění nebo tlak k dosažení svého..." },
  "Percepční dysregulace": { hint: "Otázky se týkají neobvyklých vnímání a disociativních zážitků.", example: "Např. zda vidíte nebo slyšíte věci, které ostatní ne, cítíte se odpojeni od těla..." },
  "Perseverace": { hint: "Otázky zjišťují tendenci setrvávat u věcí, i když to nedává smysl.", example: "Např. zda nedokážete přestat, i když víte, že postup nefunguje..." },
  "Restriktivní afektivita": { hint: "Otázky se zaměřují na potlačování a skrývání emocí.", example: "Např. zda nedáváte najevo emoce, působíte jako 'suchaři', nic vás nedojme..." },
  "Riskování": { hint: "Otázky zjišťují tendenci vyhledávat nebezpečí a riskantní aktivity.", example: "Např. zda si rádi zariskujete, vyhledáváte adrenalin, ignorujete rizika..." },
  "Separační nejistota": { hint: "Otázky se týkají strachu ze samoty a opuštění.", example: "Např. zda máte strach zůstat sám/sama, děláte cokoliv, abyste neztratili partnera..." },
  "Submisivita": { hint: "Otázky zjišťují míru podřizování se ostatním.", example: "Např. zda děláte to, co chtějí druzí, nedokážete říct 'ne', snadno se podřídíte..." },
  "Podezřívavost": { hint: "Otázky se zaměřují na nedůvěru k motivům ostatních lidí.", example: "Např. zda se obáváte, že vás lidé podvádějí, jsou proti vám, mají postranní úmysly..." },
  "Neobvyklé přesvědčení": { hint: "Otázky zjišťují víru v nadpřirozeno a magické myšlení.", example: "Např. zda věříte v telepatii, že myšlenky mohou ovlivnit fyzický svět..." },
  "Stažení": { hint: "Otázky se týkají sociální izolace a vyhýbání se lidem.", example: "Např. zda se vyhýbáte společenským akcím, preferujete samotu, nemáte zájem o přátelství..." },
  "Rigidita": { hint: "Otázky zjišťují perfekcionismus a rigidní lpění na pravidlech.", example: "Např. zda trvám na přesném pořádku, kontroluji věci opakovaně, vyžaduji dokonalost..." },
};

export const LPFS_SUBSCALE_HINTS = {
  identity: { hint: "Otázky se zaměřují na stabilitu sebeobrazu, sebeúctu a emoční regulaci.", example: "Jak dobře znáte sami sebe a jak stabilně se cítíte." },
  selfDirection: { hint: "Otázky zjišťují schopnost stanovovat si cíle a řídit svůj život.", example: "Zda máte jasné cíle, vnitřní standardy a motivaci." },
  empathy: { hint: "Otázky se týkají schopnosti chápat perspektivu a pocity druhých.", example: "Jak dobře rozumíte tomu, co druzí cítí a proč jednají, jak jednají." },
  intimacy: { hint: "Otázky zjišťují schopnost vytvářet a udržovat blízké vztahy.", example: "Zda dokážete budovat hluboké, vzájemné a uspokojivé vztahy." },
};

export const LPFS_SUBSCALES = {
  identity: Array.from({length: 20}, (_, i) => i),
  selfDirection: Array.from({length: 20}, (_, i) => i + 20),
  empathy: Array.from({length: 20}, (_, i) => i + 40),
  intimacy: Array.from({length: 20}, (_, i) => i + 60),
};

export const LPFS_SUBSCALE_NAMES = {
  identity: "Identita",
  selfDirection: "Sebe-řízení",
  empathy: "Empatie",
  intimacy: "Intimita",
};

export function getQuestionHint(mode, questionIndex, facets) {
  if (mode === 'pid5' && facets && facets.length > 0) {
    const f = facets[0];
    return FACET_HINTS[f] || null;
  }
  if (mode === 'lpfs') {
    const sub = getLpfsSubscale(questionIndex);
    return sub ? LPFS_SUBSCALE_HINTS[sub] : null;
  }
  return null;
}

export function getLpfsSubscale(questionIndex) {
  for (const [sub, indices] of Object.entries(LPFS_SUBSCALES)) {
    if (indices.includes(questionIndex)) return sub;
  }
  return null;
}

export const DIAG_EXPLANATIONS = {
  bpd: "Hraniční porucha osobnosti se projevuje intenzivní emoční nestabilitou, impulzivitou, strachem z opuštění a nestabilním sebeobraem. Lidé s BPD často kolísají mezi idealizací a znehodnocením blízkých osob.",
  npd: "Narcistická porucha se projevuje grandiózním pocitem vlastní důležitosti, potřebou obdivu a sníženou empatií. Za fasádou nadřazenosti bývá křehká sebeúcta.",
  aspd: "Antisociální porucha zahrnuje přehlížení práv druhých, klamavost, impulzivitu a absenci výčitek svědomí. Často se projevuje opakovaným porušováním pravidel.",
  avpd: "Vyhýbavá porucha se vyznačuje silným strachem z odmítnutí, pocity nedostačivosti a vyhýbáním se sociálním situacím i přes touhu po blízkosti.",
  ocpd: "Obsedantně-kompulzivní porucha osobnosti (ne OCD!) se projevuje perfekcionismem, rigidností, potřebou kontroly a lpěním na pravidlech na úkor flexibility.",
  stpd: "Schizotypní porucha zahrnuje excentrické chování, neobvyklé vnímání, magické myšlení a sociální stažení. Liší se od schizofrenie zachovaným kontaktem s realitou.",
  szpd: "Schizoidní rysy zahrnují emoční chlad, preferenci samoty, malý zájem o vztahy a omezený emoční projev. Nejde o stydlivost, ale o skutečný nezájem o sociální kontakt.",
  ppd: "Paranoidní rysy se projevují přetrvávající nedůvěrou, podezřívavostí vůči motivům ostatních a tendencí interpretovat neutrální jednání jako nepřátelské.",
  hpd: "Histrionské rysy zahrnují nadměrnou emotivitu, potřebu pozornosti, dramatičnost a povrchní, rychle se měnící emoce.",
  dpd: "Závislé rysy se projevují nadměrnou potřebou být opečováván/a, submisivním chováním, strachem ze samoty a neschopností činit rozhodnutí bez ujištění ostatních.",
  depressive: "Depresivní rysy osobnosti zahrnují chronický smutek, pesimismus, pocity bezcennosti a nízkou schopnost prožívat radost — jako trvalý rys osobnosti, ne epizoda.",
  adhd: "Toto NENÍ diagnóza ADHD z PID-5. Vysoké skóre v Disinhibici (roztříštěnost, impulzivita) koreluje s ADHD fenomény a může naznačovat potřebu dalšího vyšetření.",
  did: "Toto NENÍ diagnóza disociace/DID z PID-5. Vysoká percepční dysregulace zachycuje disociativní fenomény (depersonalizace, derealizace) a může naznačovat potřebu specializovaného vyšetření.",
};
