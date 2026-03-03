import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { SOURCES, FACET_META, DOMAIN_META, SCORING_INFO } from './lib/scoring-meta';
import { getQuestionHint, DIAG_EXPLANATIONS, getLpfsSubscale, LPFS_SUBSCALE_NAMES, LPFS_SUBSCALES } from './lib/question-hints';
import { exportPid5Report, exportInstagramStory, exportQuickSummary, exportLpfsReport, exportRawJson } from './lib/export-v2';
import { useAuth, saveResultToCloud, loadResultsFromCloud, deleteResultFromCloud } from './lib/auth';

const Q = ["Netěším se z věcí tak moc, jak se ostatním zdá.", "Mnoho lidí 'po mně jde'.", "Lidé by mě popsali jako lehkovážného/lehkovážnou.", "Cítím, že jednám zcela impulzivně.", "Často mívám nápady, které jsou příliš neobvyklé na to, aby je kdokoliv pochopil.", "V konverzaci ztrácím nit, protože mou pozornost poutají jiné věci.", "Vyhýbám se riskantním situacím.", "Když dojde na mé emoce, lidé mě mají za 'suchara'.", "Měním své jednání v závislosti na tom, co chtějí druzí.", "Preferuji nebýt druhým lidem příliš blízko.", "Často se dostávám do fyzických střetů.", "Obávám se být bez někoho, kdo mě miluje.", "Být hrubý/á a nepřátelský/á je prostě mojí součástí.", "Jednám tak, abych si byl/a jist/a, že si mě druzí všimnou.", "Obvykle dělám věci bez přemýšlení o tom, co by se mohlo stát.", "Dělám obvykle to, co druzí myslí, že bych měl/a dělat.", "Přestože jsem si toho vědom/a, nemohu se ubránit ukvapeným závěrům.", "Mé emoce se někdy mění bez dobrého důvodu.", "Nezajímá mě, pokud druhým způsobím utrpení.", "S problémy se nesvěřuji ostatním.", "Často říkám věci, které jiní shledávají podivnými nebo zvláštními.", "Vždy dělám věci bezhlavě.", "Připadá mi, že mě nic příliš nezajímá.", "Zdá se, že druzí lidé si myslí, že mé chování je divné.", "Lidé mi řekli, že o věcech přemýšlím skutečně zvláštním způsobem.", "Téměř nikdy si život neužívám.", "Často cítím, že skutečně nezáleží na ničem, co dělám.", "'Vyjeu' po lidech, pokud dělají maličkosti, které mě dráždí.", "Nedokážu se na nic soustředit.", "Jsem energický člověk.", "Druzí mě vidí jako nezodpovědného/nezodpovědnou.", "Umím být zlý/á, když potřebuji.", "Mé myšlenky se často ubírají podivným nebo neobvyklým směrem.", "Bylo mi řečeno, že trávím příliš mnoho času ujišťováním se, že věci jsou přesně na svém místě.", "Vyhýbám se riskantním sportům a aktivitám.", "Mohu mít potíže s rozlišováním mezi sněním a bděním.", "Někdy zažívám zvláštní pocit, že části mého těla jsou mrtvé nebo nejsou skutečně moje.", "Snadno se rozčílím.", "Nemám žádné zábrany, pokud jde o to udělat nebezpečné věci.", "Mám-li být úspěšný/á, jsem zkrátka důležitější než druzí lidé.", "O věcech, které se staly, si vymýšlím zcela nepravdivé příběhy.", "Lidé mi často vyprávějí o věcech, které jsem dělal/a, ale já si je vůbec nepamatuji.", "Dělám věci tak, aby mě lidé prostě museli obdivovat.", "Je to zvláštní, ale někdy se zdá, že normální předměty mají jiný tvar než obvykle.", "Když se něco stane, dotkne se mě to pouze na chvilku.", "Je pro mě těžké s něčím přestat, dokonce i když je čas to udělat.", "Nejsem zdatný/á v plánování budoucnosti.", "Dělám řadu věcí, které ostatní považují za riskantní.", "Lidé mi říkávají, že se příliš zaměřuji na detaily.", "Dělám si velké starosti z osamělosti.", "Prošvihl/a jsem věci, protože jsem byl/a zaneprázdněn/a snahou, aby to, co dělám, bylo naprosto správně.", "Mé myšlenky často nedávají druhým smysl.", "Často si o sobě vymýšlím, aby mi to pomohlo dostat, co chci.", "Ve skutečnosti mě příliš netrápí vidět druhé lidi trpět.", "Lidé se na mě často dívají, jako kdybych řekl/a něco skutečně divného.", "Lidé si neuvědomují, že jim lichotím, abych něco získal/a.", "Raději bych byl/a ve špatném vztahu než sám/sama.", "Obvykle myslím dříve, než jednám.", "Mívám před očima velmi živé představy, když usínám nebo se probouzím.", "Přistupuji k věcem stejným způsobem, dokonce i když to nefunguje.", "Jsem se sebou velmi nespokojený/á.", "Mám mnohem silnější emocionální reakce než téměř kdokoliv jiný.", "Dělám, co mi druzí řeknou, abych dělal/a.", "Nesnáším zůstat sám/sama, dokonce jen na pár hodin.", "Mám mimořádné kvality, které má jen málokdo další.", "Budoucnost se mi zdá skutečně beznadějná.", "Rád/a se vystavuji riziku.", "Nemohu dosahovat cílů, protože jiné věci poutají mou pozornost.", "Pokud chci něco udělat, nenechám se zastavit možným rizikem.", "Druzí si asi myslí, že jsem poněkud divný/á nebo zvláštní.", "Mé myšlenky jsou zvláštní a nepředvídatelné.", "Nestarám se o to, co druzí lidé cítí.", "Je třeba jít přes mrtvoly, abych v životě dostal/a to, co chci.", "Zbožňuji upoutávání pozornosti druhých lidí.", "Raději se klidím z cesty, abych se vyhnul/a jakékoliv skupinové činnosti.", "Pokud mi to umožní získat, co chci, dokážu být záludný/á.", "Někdy, když se podívám na známou věc, je to, jako bych ji viděl/a poprvé.", "Je pro mě obtížné přejít z jedné činnosti na jinou.", "Mám velké obavy z hrozných věcí, které by se mohly stát.", "Někdy mi dělá potíže změnit své jednání, i když to, co dělám, nejde, jak by mělo.", "Světu by se ulevilo, kdybych byl/a mrtvý/á.", "Od lidí si udržuji odstup.", "Často nedokážu kontrolovat své myšlenky.", "Nejednám emotivně.", "Nesnáším, pokud mi někdo říká, co mám dělat, dokonce i nadřízení.", "Tolik se stydím, že jsem řadou malicherností nechal/a druhé na holičkách.", "Vyhýbám se čemukoliv, co by mohlo být dokonce jen trochu nebezpečné.", "Mám potíže dosahovat stanovených cílů, dokonce i krátkodobých.", "Preferuji nepouštět milostné záležitosti do svého života.", "Nikdy bych druhému neublížil/a.", "Své emoce nedávám silně najevo.", "Jsem velmi vznětlivý/á.", "Často se obávám toho, že se stane něco špatného na základě chyb, kterých jsem se dopustil/a v minulosti.", "Mám určité nadpřirozené schopnosti, jako například to, že někdy přesně vím, co si někdo druhý myslí.", "Velmi mě znervózňuje, když přemýšlím o budoucnosti.", "Zřídka si dělám s něčím starosti.", "Užívám si být zamilovaný/á.", "Sázím na jistotu, spíše než se pouštět do zbytečných výzev.", "Někdy slyším věci, které druzí slyšet nemohou.", "Když se na něco upnu, nedokážu s tím přestat.", "Lidé mi říkají, že je těžké vědět, co cítím.", "Jsem velmi emotivní člověk.", "Druzí by mě využívali, kdyby mohli.", "Často cítím, že jsem selhal/a.", "Je pro mě nepřijatelné, pokud to, co dělám, není absolutně perfektní.", "Často mívám neobvyklé zážitky, např. vnímám přítomnost někoho, kdo tu aktuálně není.", "Dokážu dobře donutit lidi, aby dělali to, co chci.", "Ukončuji vztahy, pokud začnou být příliš blízkými.", "Stále se něčeho obávám.", "Obávám se téměř všeho.", "V davu jsem rád/a nepřehlédnutelný/á.", "Čas od času si rád/a trochu zariskuji.", "Mé chování je často smělé a poutá pozornost lidí.", "Jsem lepší než téměř kdokoliv jiný.", "Lidé si stěžují na mou potřebu mít vše zcela uspořádané.", "Vždy se s jistotou pomstím lidem, kteří mi ukřivdili.", "Jsem vždy ve střehu, aby mě někdo nezkusil podvést nebo mi ublížit.", "Mám potíže udržet mysl zaměřenou na to, co je třeba udělat.", "Hodně mluvím o sebevraždě.", "Nemám zrovna příliš velký zájem o sexuální vztahy.", "Často se mi stává, že se u něčeho zaseknu.", "Snadno emocionálně vzplanu, často i kvůli maličkostem.", "Přestože je to pro druhé k zbláznění, trvám ve všem, co dělám, na absolutní preciznosti.", "To, co dělám každý den, mě téměř nikdy netěší.", "Lichocení druhým mi pomáhá dostat, co chci.", "Někdy je třeba přehánět, aby se člověk dostal dál.", "Bojím se osamění v životě více než čehokoliv jiného.", "Zaseknu se na jednom způsobu dělání věcí, i když je jasné, že to nebude fungovat.", "Často jsem velmi lehkomyslný/á k věcem, které se týkají mě a druhých.", "Jsem velmi úzkostný člověk.", "Lidé jsou v zásadě důvěryhodní.", "Jsem snadno roztěkaný/á.", "Zdá se, že v jednání s druhými vždy přijdu zkrátka.", "Nezaváhám s podvodem, pokud mě to posune kupředu.", "Věci několikrát zkontroluji, abych se ujistil/a, že jsou perfektní.", "Nerad/a trávím čas s druhými.", "Cítím povinnost pokračovat ve věcech, i když má malý smysl je dělat.", "Nikdy nevím, kam a kdy se mé emoce 'vrtnou'.", "Stává se mi, že vidím něco, co ve skutečnosti neexistuje.", "Je pro mě důležité dělat věci určitým způsobem.", "Vždy očekávám, že se stane to nejhorší.", "Snažím se říkat pravdu, i když bolí.", "Věřím, že někteří lidé mohou ovlivňovat chod věcí svými myšlenkami.", "Nedokážu se zaměřit na věci po příliš dlouhou dobu.", "Vyhýbám se milostným vztahům.", "Přátelení se mě nezajímá.", "Při jednání s lidmi mluvím co nejméně.", "Jsem zbytečný člověk.", "Udělám zkrátka cokoliv, abych druhého neztratil/a.", "Někdy dokážu ovlivnit druhé pouze svými myšlenkami na ně.", "Život mi připadá dost bezútěšný.", "Přemýšlím o věcech zvláštním způsobem, který je pro většinu lidí nepochopitelný.", "Nezajímá mě, zda mé jednání druhým ubližuje.", "Někdy se cítím ovládaný/á myšlenkami, které náleží někomu jinému.", "Žiji skutečně naplno.", "Slibuji, co nemám v úmyslu splnit.", "Zdá se, že mi nic nedělá dobře.", "Kdeco mě snadno rozruší.", "Dělám, co chci, bez ohledu na to, jak nebezpečné by to mohlo být.", "Často zapomínám platit účty.", "Nerad/a se dostávám k lidem příliš blízko.", "Jsem dobrý/á v podvádění lidí.", "Všechno se mi zdá zbytečné.", "Nikdy nepodstupuji riziko.", "Dojmu se kvůli každé maličkosti.", "Zraním-li něčí city, není to nic významného.", "Nikdy druhým neukazuji své emoce.", "Často se cítím prostě mizerně.", "Jako člověk za nic nestojím.", "Obvykle jsem dost nepřátelský/á.", "Už jsem se z něčeho 'vykroutil/a', abych se vyhnul/a zodpovědnosti.", "Bylo mi vícekrát sděleno, že mám četné podivné rozmary a zvyky.", "Jsem rád/a ten/ta, kdo poutá pozornost.", "Stále se obávám nebo mám nervy z toho, co by se mohlo stát.", "Nikdy nechci být sám/sama.", "I když jsou věci perfektní, snažím se je ještě vylepšovat.", "Zřídkakdy cítím, že mě lidé, které znám, zkouší využívat.", "Vím, že dříve či později spáchám sebevraždu.", "Dosáhl/a jsem víc než téměř kdokoliv jiný, koho znám.", "Mohu se spolehnout na svůj šarm, když potřebuji prosadit svou.", "Mé emoce jsou nepředvídatelné.", "Lidmi se nezabývám, pokud nemusím.", "Nestarám se o problémy druhých lidí.", "Příliš nereaguji na věci, které druhé lidi dojímají.", "Mám řadu zvyků, které druzí považují za výstřední nebo zvláštní.", "Vyhýbám se společenským událostem.", "Zasluhuji si zvláštní zacházení.", "Vážně mě naštve, pokud mě lidé i nepatrným způsobem napadnou.", "Zřídka se pro něco nadchnu.", "Mám podezření, že i mí takzvaní 'kamarádi' mě hodně klamou.", "Prahnu po pozornosti.", "Někdy si myslím, že mi někdo odebírá myšlenky z hlavy.", "Mám období, kdy jsem odpojený/á od světa a sebe sama.", "Často vidím neobvyklá propojení mezi věcmi, které většina lidí přehlíží.", "Nemyslím na zranění, když dělám věci, které mohou být nebezpečné.", "Nedokážu se vyrovnat s tím, když věci nejsou na svém místě.", "Často musím jednat s lidmi, kteří jsou méně důležití než já.", "Stává se mi, že někdy napadnu lidi, abych jim připomněl/a, kdo je tu pán.", "Nechám se odpoutat od úkolu sebemenším vyrušením.", "Baví mě dělat hlupáky z veřejných činitelů.", "Prostě vynechám schůzky nebo porady, když nemám náladu.", "Snažím se dělat to, co druzí po mně chtějí.", "Dávám přednost samotě před partnerským vztahem.", "Jsem velmi impulzivní.", "Často mívám myšlenky, které mi dávají smysl, ale druzí o nich říkají, že jsou zvláštní.", "Využívám lidi, abych dostal/a, co chci.", "Nevidím smysl v pocitu viny za něco, čím jsem ublížil/a druhým lidem.", "Většinou nevidím smysl v tom být kamarádský/á.", "Měl/a jsem určité skutečně divné zkušenosti, které se velmi těžko vysvětlují.", "Své závazky dotahuji do konce.", "Rád/a na sebe přitahuji pozornost.", "Většinou se cítím provinile.", "Často 'vypnu' a pak se najednou proberu a zjistím, že uběhlo mnoho času.", "Lhát je pro mě snadné.", "Nenávidím riskování.", "Jsem nepříjemný/á a úsečný/á na kohokoliv, kdo si to zaslouží.", "Často vnímám věci kolem sebe nereálně nebo naopak reálněji, než je běžné.", "Přikrašluji pravdu, pokud mi to přinese výhody.", "Je pro mě jednoduché využívat druhé.", "Když něco dělám, mám na to přesný postup."];

const LPFS_Q = ["V mnoha rozličných situacích se dokážu chovat přiměřeně k dané situaci.", "Jediné, co dokážu u druhých lidí opravdu chápat, jsou jejich slabosti.", "Téměř žádný blízký vztah nakonec nedopadne dobře.", "I když mohu mít různé pocity za různých okolností, zvládám je všechny docela dobře.", "I když se snažím, nedokážu si udržet žádné úspěšné a trvalé vztahy.", "I když si vážím blízkých vztahů, někdy se mi postaví do cesty silné emoce.", "Události v mém životě mohou opravdu ovlivnit, jestli se cítím dobře nebo ne.", "Zpětná vazba od druhých hraje velkou roli při určování toho, co je pro mě důležité.", "Sbližování se s druhými lidmi mě velmi neláká.", "Sbližování se s druhými mě dělá zranitelným/nou, a ve skutečnosti to nestojí za riziko.", "Dokážu ocenit názor druhých lidí, i když s nimi nesouhlasím.", "Mohu se sblížit jen s někým, kdo mi velmi dobře rozumí.", "Mohu se sblížit jen s někým, kdo dokáže uznat a řešit mé potřeby.", "Dokážu ustoupit a objektivně posoudit, jak se v danou chvíli cítím.", "Neumím vždy rozeznat rozdíl mezi tím, co je můj názor, a jak si ostatní lidé přejí, abych myslel/a.", "Ani si nedovedu představit život, který by mě uspokojil.", "Nesnáším, když jsou v názorech ostré rozdíly.", "Nemám ponětí, proč ostatní lidé dělají to, co dělají.", "Nemám moc pozitivních interakcí s druhými lidmi.", "Nevěnuji moc pozornosti, a moc se nestarám o to, jak působím na druhé lidi.", "Vůbec necháhu, co ostatní lidi motivuje.", "Neztrácím čas přemýšlením o svých zážitcích, pocitech a činech.", "Mám silnou potřebu, aby mě ostatní schvalovali.", "Mám potíže stanovovat si a dokončovat cíle.", "Nechápu, jak se cítím nebo co dělám.", "Mám mnoho uspokojivých vztahů jak v soukromí, tak v práci.", "Mám vztahy, ale jen málo z nich považuji za blízké.", "Se stanovováním cílů mám určité potíže.", "Mám potíže s rozhodováním se mezi různými cíli.", "Většinou konám v daném okamžiku, než bych se soustředil/a na dlouhodobé cíle.", "Většinou druhým věnuji pozornost podle toho, jak mě mohou v nějakém ohledu ovlivnit.", "Většinou lidem věnuji pozornost na základě toho, co mi mohou udělat, nebo co pro mě mohou udělat.", "Zdá se, že nikdy nemám velkou naději, že se mi stanou dobré věci.", "Stanovuji si nároky, které je velmi obtížné splnit.", "Mám sklon cítit se ze sebe buď opravdu dobře, nebo opravdu špatně.", "Mám sklon nechávat ostatní, aby mi určovali cíle, než bych si je určoval/a sám/sama.", "Při jednání s druhými se snažím být flexibilní a spolupracující.", "Obvykle chápu pocity druhých lidí lépe než oni sami.", "Pracuji na svých blízkých vztazích, protože jsou pro mě důležité.", "Jsem si jistý/á rozdílem mezi svými hodnotami a hodnotami, které ostatní chtějí, abych měl/a.", "Nedokážu ustoupit a dívat se objektivně na svůj život.", "Nejsem si jistý/á svými osobními standardy.", "Zajímají mě jen vztahy, ve kterých o mě bude nějak postaráno.", "Jsem si velmi dobře vědom/a, jak působím na druhé lidi.", "V blízkém vztahu je to, jako bych bez druhého nemohl/a žít.", "V blízkých vztazích mám tendenci být rozpolcen/a mezi strachem a 'upnutostí'.", "V mnoha situacích se cítím úplně jinak, než by ostatní očekávali.", "Ve velmi těžkých časech někdy ztrácím ponětí o tom, co je pro mě důležité.", "Po interakci s druhými lidmi se obvykle cítím zmateně.", "Zdá se, že většina lidí má život uspořádaný lépe než já.", "Mám cíle, které odpovídají mým schopnostem.", "Měl jsem trvalé vztahy, ale nebyly vždy velmi uspokojivé.", "Život je nebezpečné místo bez většího smyslu.", "Mnoho lidí v mém okolí má velmi destruktivní úmysly.", "Většina věcí, které dělám, je reakcí na to, co dělají druzí.", "Moje emoce se rychle mění.", "Můj život je v zásadě řízen jednáním druhých.", "Moje úmysly jsou mi spíše vnuceny, než že by byly mou volbou.", "Moje osobní standardy se dost mění podle okolností.", "Druzí lidé ode mě často očekávají příliš mnoho.", "Lidé si myslí, že ve většině situací dokážu dobře číst pocity a motivy druhých.", "Lidé si myslí, že jsem 'nenávistník'/'hater', ale často se to týká spíše jich než mě.", "Vztahy jsou převážně zdrojem bolesti a utrpení.", "Někdy se starám jen o své cíle.", "Někdy jsem na sebe příliš tvrdý/á.", "Někdy mám pocit, že někteří lidé jsou jako já; jindy jsem přesvědčen/á, že vůbec nejsou jako já.", "Někdy moc nespolupracuji, protože druzí lidé nesplňují moje nároky.", "Někdy je pro mě snadné přehlédnout vliv, který mám na ostatní.", "Klíčem k úspěšnému vztahu je, když jsou uspokojeny mé potřeby.", "Nároky, které si na sebe kladu, se často zdají být příliš náročné nebo ne dost náročné.", "To, jak mě ostatní vnímají, je zcela odlišné od toho, jaký/á opravdu jsem.", "Jsou části mé osobnosti, které k sobě moc dobře nesedí.", "Při jednání s lidmi se dívám hlavně na to, jak mě mohou ovlivnit.", "Když jsou pocity příliš silné, snažím se před nimi uzavřít.", "Když s druhými nesouhlasím, často nemá smysl snažit se vidět věci z jejich perspektivy.", "Když mám pocit, že jsem něco udělal/a dobře, mám téměř vždy pravdu.", "Když se mi v něčem nedaří, mohl/a bych se velmi rozzlobit nebo se stydět za své schopnosti.", "Když jsem úspěšný/á, mám tendenci se cítit jako podvodník.", "Když se mnou ostatní nesouhlasí, je těžké udržet své emoce pod kontrolou.", "Když o sobě přemýšlím, dokážu vnímat jen určité aspekty sebe sama."];

const FM = {"Anhedonie": [0, 22, 25, 26, 123, 156, 188, 189], "Úzkostnost": [78, 92, 94, 108, 109, 129, 140, 173], "Vyhášení pozornosti": [13, 42, 73, 110, 112, 172, 190, 210], "Bezcitnost": [18, 53, 71, 89, 152, 165, 182, 183], "Klamavost": [40, 52, 55, 125, 133, 155, 161, 213], "Depresivita": [60, 65, 80, 103, 147, 150, 157, 168], "Roztříštěnost": [5, 28, 67, 117, 131, 143, 198, 199], "Excentricita": [20, 23, 24, 32, 69, 70, 151, 171, 184, 204], "Emoční labilita": [17, 61, 121, 137, 157, 164, 180, 211], "Grandiozita": [39, 64, 113, 114, 178, 186, 196, 197], "Hostilita": [27, 31, 37, 84, 115, 169, 187, 215], "Impulzivita": [3, 4, 14, 21, 128, 158, 203, 219], "Vyhýbání se intimitě": [9, 81, 88, 107, 119, 144, 145, 202], "Nezodpovědnost": [30, 46, 86, 88, 159, 170, 200, 209], "Manipulativnost": [55, 72, 75, 106, 124, 125, 134, 179], "Percepční dysregulace": [35, 36, 41, 43, 58, 76, 93, 98, 138, 142, 149, 192, 194, 212, 216], "Perseverace": [45, 59, 77, 79, 99, 120, 127, 136], "Restriktivní afektivita": [7, 83, 90, 100, 146, 166, 183, 167], "Riskování": [6, 34, 38, 47, 48, 66, 68, 87, 96, 97, 111, 163, 195, 214], "Separační nejistota": [11, 49, 56, 63, 126, 148, 174, 201], "Submisivita": [8, 15, 16, 62, 63, 201, 202, 9], "Podezřívavost": [1, 102, 116, 117, 132, 133, 176, 189], "Neobvyklé přesvědčení": [93, 94, 142, 143, 149, 150, 192, 205], "Stažení": [9, 74, 81, 82, 119, 135, 145, 161, 182, 185, 207], "Rigidita": [33, 49, 51, 60, 78, 80, 104, 115, 122, 135, 139, 175, 196, 219]};
const DF = {"Negativní afektivita": ["Emoční labilita", "Úzkostnost", "Separační nejistota", "Hostilita", "Perseverace", "Submisivita", "Restriktivní afektivita"], "Odtažitost": ["Stažení", "Vyhýbání se intimitě", "Anhedonie", "Depresivita", "Restriktivní afektivita", "Podezřívavost"], "Antagonismus": ["Manipulativnost", "Klamavost", "Grandiozita", "Vyhášení pozornosti", "Bezcitnost"], "Disinhibice": ["Nezodpovědnost", "Impulzivita", "Roztříštěnost", "Riskování", "Rigidita"], "Psychoticismus": ["Neobvyklé přesvědčení", "Excentricita", "Percepční dysregulace"]};
const DC = {"Negativní afektivita": "#F87171", "Odtažitost": "#60A5FA", "Antagonismus": "#FBBF24", "Disinhibice": "#34D399", "Psychoticismus": "#C084FC"};

const REVERSE = {};
Object.entries(FM).forEach(([f, items]) => items.forEach(i => { if(!REVERSE[i]) REVERSE[i]=[]; REVERSE[i].push(f); }));
function facetDomain(f) { for (const [d, fs] of Object.entries(DF)) { if (fs.includes(f)) return d; } return null; }
function scoreFacets(answers) { const r = {}; Object.entries(FM).forEach(([f, items]) => { const vals = items.map(i => answers[i]).filter(v => v !== undefined && v !== null); r[f] = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0; }); return r; }
function scoreDomains(facetScores) { const r = {}; Object.entries(DF).forEach(([d, fs]) => { const vals = fs.map(f => facetScores[f] || 0); r[d] = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0; }); return r; }
const SEV = (v) => v < 0.5 ? "Nízké" : v < 1.0 ? "Mírné" : v < 2.0 ? "Zvýšené" : "Vysoké";
const SEV_CLR = (v) => v < 0.5 ? "#4ADE80" : v < 1.0 ? "#FBBF24" : v < 2.0 ? "#FB923C" : "#F87171";

function scoreLpfsSubscales(lpfsAns) {
  const r = {};
  Object.entries(LPFS_SUBSCALES).forEach(([sub, indices]) => {
    const vals = indices.map(i => lpfsAns[i]).filter(v => v !== undefined && v !== null);
    r[sub] = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
  });
  return r;
}

// ═══ DIAGNOSTIC PROFILES ═══
const DIAG_PROFILES = [
  { id: "bpd", name: "Hraniční porucha osobnosti (BPD)", color: "#F87171", desc: "DSM-5 alternativní model: Emoční labilita, Impulzivita, Separační nejistota, Depresivita, Hostilita, Riskování, Úzkostnost.", facets: ["Emoční labilita", "Impulzivita", "Separační nejistota", "Depresivita", "Hostilita", "Riskování", "Úzkostnost"], weights: { "Emoční labilita": 1.5, "Impulzivita": 1.3, "Separační nejistota": 1.3, "Depresivita": 1.0, "Hostilita": 1.2, "Riskování": 0.8, "Úzkostnost": 0.9 }, threshold: 1.3 },
  { id: "npd", name: "Narcistická porucha osobnosti (NPD)", color: "#FBBF24", desc: "DSM-5 alternativní model: Grandiozita, Vyhášení pozornosti. Antagonismus celkově.", facets: ["Grandiozita", "Vyhášení pozornosti", "Manipulativnost", "Bezcitnost", "Klamavost"], weights: { "Grandiozita": 1.5, "Vyhášení pozornosti": 1.3, "Manipulativnost": 1.0, "Bezcitnost": 0.8, "Klamavost": 0.7 }, threshold: 1.3 },
  { id: "aspd", name: "Antisociální porucha osobnosti (ASPD)", color: "#EF4444", desc: "DSM-5 alternativní model: Manipulativnost, Klamavost, Bezcitnost, Hostilita, Impulzivita, Riskování, Nezodpovědnost.", facets: ["Manipulativnost", "Klamavost", "Bezcitnost", "Hostilita", "Impulzivita", "Riskování", "Nezodpovědnost"], weights: { "Manipulativnost": 1.3, "Klamavost": 1.3, "Bezcitnost": 1.5, "Hostilita": 1.2, "Impulzivita": 1.0, "Riskování": 1.0, "Nezodpovědnost": 1.2 }, threshold: 1.3 },
  { id: "avpd", name: "Vyhýbavá porucha osobnosti (AvPD)", color: "#60A5FA", desc: "DSM-5 alternativní model: Úzkostnost, Stažení, Anhedonie, Vyhýbání se intimitě.", facets: ["Úzkostnost", "Stažení", "Anhedonie", "Vyhýbání se intimitě", "Separační nejistota", "Submisivita"], weights: { "Úzkostnost": 1.5, "Stažení": 1.3, "Anhedonie": 1.0, "Vyhýbání se intimitě": 1.3, "Separační nejistota": 0.8, "Submisivita": 0.9 }, threshold: 1.3 },
  { id: "ocpd", name: "Obsedantně-kompulzivní porucha osobnosti (OCPD)", color: "#A78BFA", desc: "DSM-5 alternativní model: Rigidita, Perseverace + Restriktivní afektivita, Vyhýbání se intimitě (neg.).", facets: ["Rigidita", "Perseverace", "Restriktivní afektivita", "Úzkostnost", "Submisivita"], weights: { "Rigidita": 1.5, "Perseverace": 1.3, "Restriktivní afektivita": 1.0, "Úzkostnost": 0.8, "Submisivita": 0.7 }, threshold: 1.3 },
  { id: "stpd", name: "Schizotypní porucha osobnosti (StPD)", color: "#C084FC", desc: "DSM-5 alternativní model: Excentricita, Percepční dysregulace, Neobvyklé přesvědčení, Stažení, Podezřívavost.", facets: ["Excentricita", "Percepční dysregulace", "Neobvyklé přesvědčení", "Stažení", "Podezřívavost", "Restriktivní afektivita"], weights: { "Excentricita": 1.5, "Percepční dysregulace": 1.3, "Neobvyklé přesvědčení": 1.3, "Stažení": 1.0, "Podezřívavost": 1.0, "Restriktivní afektivita": 0.7 }, threshold: 1.3 },
  { id: "szpd", name: "Schizoidní rysy osobnosti", color: "#94A3B8", desc: "Stažení, Anhedonie, Restriktivní afektivita, Vyhýbání se intimitě.", facets: ["Stažení", "Anhedonie", "Restriktivní afektivita", "Vyhýbání se intimitě", "Depresivita"], weights: { "Stažení": 1.5, "Anhedonie": 1.3, "Restriktivní afektivita": 1.3, "Vyhýbání se intimitě": 1.2, "Depresivita": 0.8 }, threshold: 1.3 },
  { id: "ppd", name: "Paranoidní rysy osobnosti", color: "#FB923C", desc: "Podezřívavost, Hostilita, Stažení, Vyhýbání se intimitě.", facets: ["Podezřívavost", "Hostilita", "Stažení", "Vyhýbání se intimitě", "Restriktivní afektivita"], weights: { "Podezřívavost": 1.5, "Hostilita": 1.3, "Stažení": 1.0, "Vyhýbání se intimitě": 1.0, "Restriktivní afektivita": 0.7 }, threshold: 1.3 },
  { id: "hpd", name: "Histrionské rysy osobnosti", color: "#F472B6", desc: "Vyhášení pozornosti, Emoční labilita, Manipulativnost, Separační nejistota.", facets: ["Vyhášení pozornosti", "Emoční labilita", "Manipulativnost", "Separační nejistota", "Submisivita"], weights: { "Vyhášení pozornosti": 1.5, "Emoční labilita": 1.2, "Manipulativnost": 1.0, "Separační nejistota": 1.0, "Submisivita": 0.8 }, threshold: 1.3 },
  { id: "dpd", name: "Závislé rysy osobnosti (DPD)", color: "#38BDF8", desc: "Submisivita, Separační nejistota, Úzkostnost.", facets: ["Submisivita", "Separační nejistota", "Úzkostnost", "Depresivita"], weights: { "Submisivita": 1.5, "Separační nejistota": 1.5, "Úzkostnost": 1.0, "Depresivita": 0.8 }, threshold: 1.3 },
  { id: "depressive", name: "Depresivní rysy osobnosti", color: "#64748B", desc: "Depresivita, Anhedonie, Úzkostnost, Submisivita.", facets: ["Depresivita", "Anhedonie", "Úzkostnost", "Submisivita", "Restriktivní afektivita"], weights: { "Depresivita": 1.5, "Anhedonie": 1.3, "Úzkostnost": 1.0, "Submisivita": 0.8, "Restriktivní afektivita": 0.7 }, threshold: 1.3 },
  { id: "adhd", name: "ADHD — indikátory (ne-PD)", color: "#34D399", desc: "PID-5 neměří ADHD, ale Disinhibice koreluje s ADHD fenomény.", facets: ["Roztříštěnost", "Impulzivita", "Nezodpovědnost", "Riskování"], weights: { "Roztříštěnost": 1.5, "Impulzivita": 1.3, "Nezodpovědnost": 1.2, "Riskování": 0.8 }, threshold: 1.3 },
  { id: "did", name: "Disociace / DID — indikátory (ne-PD)", color: "#E879F9", desc: "PID-5 neměří disociaci, ale percepční dysregulace zachycuje disociativní fenomény.", facets: ["Percepční dysregulace", "Neobvyklé přesvědčení", "Excentricita", "Depresivita"], weights: { "Percepční dysregulace": 1.5, "Neobvyklé přesvědčení": 1.3, "Excentricita": 0.8, "Depresivita": 0.7 }, threshold: 1.3 },
];

function scoreDiagnostics(fScores) {
  return DIAG_PROFILES.map(prof => {
    let totalW = 0, totalS = 0;
    prof.facets.forEach(f => { const w = prof.weights[f] || 1; totalW += w; totalS += (fScores[f] || 0) * w; });
    const score = totalW > 0 ? totalS / totalW : 0;
    return { ...prof, score, flag: score >= prof.threshold };
  }).sort((a, b) => b.score - a.score);
}

// ═══ TOOLTIP COMPONENT ═══
function HoverTip({ children, text, wide }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  if (!text) return children;
  return (
    <span className="relative inline-block" ref={ref} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className={`absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl text-xs leading-relaxed text-gray-200 bg-gray-800/95 border border-gray-600/40 backdrop-blur-xl shadow-2xl pointer-events-none animate-in fade-in ${wide ? 'w-72' : 'w-56'}`}
          style={{animation: 'fadeIn .15s ease-out'}}>
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700/80" />
        </span>
      )}
    </span>
  );
}

// ═══ localStorage ═══
const LS_KEYS = { answers: 'diag_pid5_answers', idx: 'diag_pid5_idx', lpfsAns: 'diag_lpfs_answers', lpfsIdx: 'diag_lpfs_idx', history: 'diag_results_history' };
function lsGet(key, fallback) { try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

export default function App() {
  const auth = useAuth();
  const [mode, setMode] = useState("menu");
  const [idx, setIdx] = useState(() => lsGet(LS_KEYS.idx, 0));
  const [answers, setAnswers] = useState(() => lsGet(LS_KEYS.answers, {}));
  const [lpfsIdx, setLpfsIdx] = useState(() => lsGet(LS_KEYS.lpfsIdx, 0));
  const [lpfsAns, setLpfsAns] = useState(() => lsGet(LS_KEYS.lpfsAns, {}));
  const [hoveredVal, setHoveredVal] = useState(null);
  const [showDiagLive, setShowDiagLive] = useState(true);
  const [showScoringInfo, setShowScoringInfo] = useState(false);
  const [history, setHistory] = useState(() => lsGet(LS_KEYS.history, []));
  const [showHistory, setShowHistory] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [authForm, setAuthForm] = useState(null); // null | 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [cloudResults, setCloudResults] = useState([]);

  useEffect(() => { lsSet(LS_KEYS.answers, answers); }, [answers]);
  useEffect(() => { lsSet(LS_KEYS.idx, idx); }, [idx]);
  useEffect(() => { lsSet(LS_KEYS.lpfsAns, lpfsAns); }, [lpfsAns]);
  useEffect(() => { lsSet(LS_KEYS.lpfsIdx, lpfsIdx); }, [lpfsIdx]);
  useEffect(() => { lsSet(LS_KEYS.history, history); }, [history]);

  // Load cloud results when user signs in
  useEffect(() => {
    if (auth?.user) {
      loadResultsFromCloud(auth.user).then(setCloudResults);
    } else {
      setCloudResults([]);
    }
  }, [auth?.user]);

  const saveToHistory = useCallback((type, data) => {
    const entry = { id: Date.now(), type, date: new Date().toISOString(), ...data };
    setHistory(prev => [entry, ...prev].slice(0, 50));
    // Also save to cloud if authenticated
    if (auth?.user) {
      saveResultToCloud(auth.user, type, { ...data, date: entry.date }).then(() => {
        loadResultsFromCloud(auth.user).then(setCloudResults);
      });
    }
  }, [auth?.user]);

  useEffect(() => {
    if (mode === 'pid5_results' && Object.keys(answers).length === 220) {
      const recent = history[0];
      if (!recent || recent.type !== 'pid5' || Date.now() - recent.id > 60000) {
        const diags = scoreDiagnostics(scoreFacets(answers));
        saveToHistory('pid5', { topDiags: diags.filter(d => d.flag).map(d => ({ name: d.name, score: d.score, color: d.color })), fullData: { domeny: scoreDomains(scoreFacets(answers)), facety: scoreFacets(answers), diagnostika: diags.map(d => ({id:d.id,name:d.name,score:d.score,flag:d.flag})), odpovedi: answers } });
      }
    }
    if (mode === 'lpfs_results' && Object.keys(lpfsAns).length === 80) {
      const recent = history[0];
      if (!recent || recent.type !== 'lpfs' || Date.now() - recent.id > 60000) {
        const vals = Object.values(lpfsAns);
        const avg = vals.reduce((a,b) => a+b, 0) / vals.length;
        saveToHistory('lpfs', { score: avg, fullData: { prumer: avg, subskaly: scoreLpfsSubscales(lpfsAns), odpovedi: lpfsAns } });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, saveToHistory]);

  const curAns = mode === "pid5" ? answers : lpfsAns;
  const answered = Object.keys(curAns).length;

  const answer = useCallback((val) => {
    if (mode === "pid5") {
      setAnswers(p => ({...p, [idx]: val}));
      if (idx < Q.length - 1) setTimeout(() => setIdx(idx + 1), 200);
      else setTimeout(() => setMode("pid5_results"), 400);
    } else if (mode === "lpfs") {
      setLpfsAns(p => ({...p, [lpfsIdx]: val}));
      if (lpfsIdx < LPFS_Q.length - 1) setTimeout(() => setLpfsIdx(lpfsIdx + 1), 200);
      else setTimeout(() => setMode("lpfs_results"), 400);
    }
  }, [mode, idx, lpfsIdx]);

  useEffect(() => {
    if (mode !== "pid5" && mode !== "lpfs") return;
    const isPid = mode === "pid5";
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const key = e.key;
      if (isPid && ["0","1","2","3"].includes(key)) { e.preventDefault(); answer(parseInt(key)); }
      else if (!isPid && ["1","2","3","4"].includes(key)) { e.preventDefault(); answer(parseInt(key)); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, answer]);

  const facetScores = useMemo(() => scoreFacets(answers), [answers]);
  const domainScores = useMemo(() => scoreDomains(facetScores), [facetScores]);
  const diagnostics = useMemo(() => scoreDiagnostics(facetScores), [facetScores]);
  const lpfsSubscaleScores = useMemo(() => scoreLpfsSubscales(lpfsAns), [lpfsAns]);

  const previewFacetScores = useMemo(() => {
    if (hoveredVal === null || mode !== "pid5") return facetScores;
    return scoreFacets({ ...answers, [idx]: hoveredVal });
  }, [hoveredVal, answers, idx, mode, facetScores]);
  const previewDomainScores = useMemo(() => {
    if (hoveredVal === null || mode !== "pid5") return domainScores;
    return scoreDomains(previewFacetScores);
  }, [hoveredVal, mode, previewFacetScores, domainScores]);
  const previewDiagnostics = useMemo(() => {
    if (hoveredVal === null || mode !== "pid5") return diagnostics;
    return scoreDiagnostics(previewFacetScores);
  }, [hoveredVal, mode, previewFacetScores, diagnostics]);

  // LPFS preview scores
  const previewLpfsSubscales = useMemo(() => {
    if (hoveredVal === null || mode !== "lpfs") return lpfsSubscaleScores;
    return scoreLpfsSubscales({ ...lpfsAns, [lpfsIdx]: hoveredVal });
  }, [hoveredVal, lpfsAns, lpfsIdx, mode, lpfsSubscaleScores]);
  const previewLpfsTotal = useMemo(() => {
    if (hoveredVal === null || mode !== "lpfs") return null;
    const newAns = { ...lpfsAns, [lpfsIdx]: hoveredVal };
    const vals = Object.values(newAns);
    return vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
  }, [hoveredVal, lpfsAns, lpfsIdx, mode]);

  const radarData = useMemo(() =>
    Object.entries(domainScores).map(([d, v]) => ({ domain: d.replace("Negativní afektivita","Neg. afekt.").replace("Psychoticismus","Psychotic."), value: Math.round(v * 100) / 100, full: d })),
    [domainScores]
  );

  const lpfsTotal = useMemo(() => {
    const vals = Object.values(lpfsAns);
    return vals.length ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length * 100) / 100 : 0;
  }, [lpfsAns]);

  const fillSample = useCallback(() => { const s = {}; for (let i = 0; i < 220; i++) { const r = Math.random(); s[i] = r < 0.2 ? 0 : r < 0.5 ? 1 : r < 0.8 ? 2 : 3; } setAnswers(s); setIdx(219); setMode("pid5_results"); }, []);
  const fillSampleLpfs = useCallback(() => { const s = {}; for (let i = 0; i < 80; i++) { const r = Math.random(); s[i] = r < 0.2 ? 1 : r < 0.5 ? 2 : r < 0.8 ? 3 : 4; } setLpfsAns(s); setLpfsIdx(79); setMode("lpfs_results"); }, []);

  const handleAuth = async (action) => {
    setAuthError('');
    const res = action === 'login' ? await auth.signIn(authEmail, authPass) : await auth.signUp(authEmail, authPass);
    if (res?.error) setAuthError(res.error.message);
    else { setAuthForm(null); setAuthEmail(''); setAuthPass(''); }
  };

  // ═══ DiagCard component ═══
  const DiagCard = ({ diag, fScores }) => {
    const { name, color, desc, facets: dFacets, score, flag, id } = diag;
    const explanation = DIAG_EXPLANATIONS[id];
    return (
      <div className={`mb-4 p-4 rounded-xl border transition-all ${flag ? 'border-opacity-40' : 'border-gray-700/30 bg-gray-800/20'}`} style={flag ? { borderColor: color + '50', background: color + '08' } : {}}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
          <HoverTip text={explanation} wide>
            <span className="font-semibold text-sm cursor-help" style={{ color: flag ? color : '#9CA3AF' }}>{name}</span>
          </HoverTip>
          <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: flag ? color + '20' : '#374151', color: flag ? color : '#6B7280' }}>
            {score.toFixed(2)} — {flag ? 'Zvýšené' : score >= 1.0 ? 'Mírné' : 'Nízké'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3">{desc}</p>
        <div className="space-y-1">
          {dFacets.map(f => {
            const v = fScores[f] || 0;
            const meta = FACET_META[f];
            return (
              <div key={f} className="flex items-center gap-2">
                <HoverTip text={meta?.desc}>
                  <div className="w-36 text-xs text-gray-400 truncate cursor-help">↳ {f}</div>
                </HoverTip>
                <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(v/3)*100}%`, background: SEV_CLR(v) }} />
                </div>
                <div className="w-10 text-right text-xs font-mono text-gray-400">{v.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ═══ AUTH MODAL ═══
  const AuthModal = () => authForm && (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAuthForm(null)}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">{authForm === 'login' ? '🔐 Přihlášení' : '📝 Registrace'}</h3>
        {authError && <div className="text-red-400 text-xs mb-3 p-2 rounded-lg bg-red-950/30 border border-red-500/20">{authError}</div>}
        <input type="email" placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-gray-200 focus:outline-none focus:border-purple-500" />
        <input type="password" placeholder="Heslo" value={authPass} onChange={e => setAuthPass(e.target.value)}
          className="w-full mb-4 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
          onKeyDown={e => e.key === 'Enter' && handleAuth(authForm)} />
        <button onClick={() => handleAuth(authForm)} className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm mb-2">
          {authForm === 'login' ? 'Přihlásit se' : 'Zaregistrovat se'}
        </button>
        <button onClick={() => setAuthForm(authForm === 'login' ? 'signup' : 'login')} className="w-full text-center text-xs text-gray-500 hover:text-gray-300">
          {authForm === 'login' ? 'Nemáte účet? Registrace' : 'Máte účet? Přihlášení'}
        </button>
      </div>
    </div>
  );

  // ── MENU ──
  if (mode === "menu") return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <AuthModal />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent mb-3">Diagnostický protokol</h1>
        <p className="text-gray-400 text-lg">PID-5 & LPFS-SR — interaktivní vyplňování</p>
        {/* Auth status */}
        <div className="mt-4">
          {auth?.user ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-xs text-green-400/80">☁ {auth.user.email}</span>
              <button onClick={() => auth.signOut()} className="text-xs text-gray-500 hover:text-gray-300">Odhlásit</button>
            </div>
          ) : auth?.isConfigured ? (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setAuthForm('login')} className="text-xs text-purple-400 hover:text-purple-300">🔐 Přihlásit se</button>
              <span className="text-gray-700">·</span>
              <button onClick={() => setAuthForm('signup')} className="text-xs text-gray-500 hover:text-gray-300">Registrace</button>
            </div>
          ) : (
            <span className="text-xs text-gray-700">💾 Data se ukládají lokálně</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button onClick={() => setMode("pid5")} className="p-6 rounded-2xl bg-linear-to-br from-purple-900/60 to-purple-800/30 border border-purple-500/30 backdrop-blur-xl hover:border-purple-400/60 transition-all text-left">
          <div className="text-xl font-semibold text-purple-300">PID-5</div>
          <div className="text-sm text-gray-400 mt-1">220 otázek · 25 facet · 5 domén · 13 diagnostických profilů</div>
          {Object.keys(answers).length > 0 && <div className="text-xs text-purple-400 mt-2">▸ Rozpracováno: {Object.keys(answers).length}/220</div>}
        </button>
        <button onClick={() => setMode("lpfs")} className="p-6 rounded-2xl bg-linear-to-br from-blue-900/60 to-blue-800/30 border border-blue-500/30 backdrop-blur-xl hover:border-blue-400/60 transition-all text-left">
          <div className="text-xl font-semibold text-blue-300">LPFS-SR</div>
          <div className="text-sm text-gray-400 mt-1">80 otázek · úroveň fungování osobnosti</div>
          {Object.keys(lpfsAns).length > 0 && <div className="text-xs text-blue-400 mt-2">▸ Rozpracováno: {Object.keys(lpfsAns).length}/80</div>}
        </button>
        {Object.keys(answers).length === 220 && <button onClick={() => setMode("pid5_results")} className="p-4 rounded-2xl bg-linear-to-br from-green-900/60 to-green-800/30 border border-green-500/30 text-green-300 font-semibold">Zobrazit PID-5 výsledky</button>}
        {Object.keys(lpfsAns).length === 80 && <button onClick={() => setMode("lpfs_results")} className="p-4 rounded-2xl bg-linear-to-br from-green-900/60 to-green-800/30 border border-green-500/30 text-green-300 font-semibold">Zobrazit LPFS výsledky</button>}

        <div className="border-t border-gray-800 pt-4 mt-4">
          <div className="text-xs text-gray-600 mb-2">🔧 Debug — vzorek dat</div>
          <div className="flex gap-2">
            <button onClick={fillSample} className="flex-1 p-3 rounded-xl bg-gray-800/50 border border-gray-700/30 text-gray-400 text-xs hover:text-gray-200 hover:border-gray-600 transition-all">🎲 PID-5</button>
            <button onClick={fillSampleLpfs} className="flex-1 p-3 rounded-xl bg-gray-800/50 border border-gray-700/30 text-gray-400 text-xs hover:text-gray-200 hover:border-gray-600 transition-all">🎲 LPFS</button>
            <button onClick={() => { setAnswers({}); setIdx(0); setLpfsAns({}); setLpfsIdx(0); }} className="flex-1 p-3 rounded-xl bg-gray-800/50 border border-red-900/30 text-gray-500 text-xs hover:text-red-300 hover:border-red-700 transition-all">🗑 Reset</button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="border-t border-gray-800 pt-4 mt-4">
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center justify-between w-full text-left">
              <span className="text-xs text-gray-500">📋 Historie výsledků ({history.length})</span>
              <span className="text-xs text-gray-600">{showHistory ? '▾ Sbalit' : '▸ Rozbalit'}</span>
            </button>
            {showHistory && (
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                {history.map((h) => (
                  <div key={h.id} className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className={h.type === 'pid5' ? 'text-purple-400 font-semibold' : 'text-blue-400 font-semibold'}>{h.type === 'pid5' ? 'PID-5' : 'LPFS-SR'}</span>
                      <span className="text-gray-600">{new Date(h.date).toLocaleString('cs-CZ')}</span>
                    </div>
                    {h.type === 'pid5' && h.topDiags && <div className="text-gray-400 mt-1">{h.topDiags.map((d, j) => <span key={j} className="inline-block mr-2"><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: d.color }} />{d.name.split('(')[0].split('—')[0].trim()}: {d.score.toFixed(2)}</span>)}</div>}
                    {h.type === 'lpfs' && <div className="text-gray-400 mt-1">Průměr: {h.score?.toFixed(2)}</div>}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { const blob = new Blob([JSON.stringify(h.fullData, null, 2)], {type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${h.type}_${h.date.slice(0,10)}.json`; a.click(); }} className="text-gray-500 hover:text-gray-300">Export</button>
                      <button onClick={() => { if (confirm('Smazat?')) setHistory(prev => prev.filter(x => x.id !== h.id)); }} className="text-gray-600 hover:text-red-400">Smazat</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── PID-5 RESULTS ──
  if (mode === "pid5_results") return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setMode("menu")} className="text-gray-500 hover:text-gray-300 mb-6 text-sm">← Zpět</button>
        <h2 className="text-3xl font-bold text-purple-300 mb-2">PID-5 — Výsledky</h2>
        <p className="text-gray-400 mb-8">Vyplněno {Object.keys(answers).length}/220 položek</p>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Domény — Radar</h3>
          <div className="w-full" style={{height: 350}}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="domain" tick={{fill:'#9CA3AF', fontSize:12}} />
                <PolarRadiusAxis domain={[0, 3]} tick={{fill:'#6B7280', fontSize:10}} />
                <Radar dataKey="value" stroke="#C084FC" fill="#C084FC" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{background:'#1F2937',border:'1px solid #374151',borderRadius:12,color:'#fff'}} formatter={(v,_n,p) => [v.toFixed(2), p.payload.full]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Domény — Přehled</h3>
          {Object.entries(domainScores).map(([d, v]) => (
            <HoverTip key={d} text={DOMAIN_META[d]?.desc} wide>
              <div className="flex items-center gap-3 mb-3 cursor-help">
                <div className="w-40 text-sm font-medium" style={{color: DC[d]}}>{d}</div>
                <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{width: `${(v/3)*100}%`, background: DC[d]}} />
                </div>
                <div className="w-12 text-right text-sm font-mono">{v.toFixed(2)}</div>
                <div className="w-16 text-xs text-right" style={{color: SEV_CLR(v)}}>{SEV(v)}</div>
              </div>
            </HoverTip>
          ))}
        </div>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Facety — Detail</h3>
          <div className="space-y-2">
            {Object.entries(DF).map(([domain, facetList]) => (
              <div key={domain} className="mb-4">
                <div className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{color: DC[domain]}}>{domain}</div>
                {facetList.map(f => {
                  const v = facetScores[f] || 0;
                  const meta = FACET_META[f];
                  return (
                    <HoverTip key={f} text={meta?.desc} wide>
                      <div className="flex items-center gap-2 py-1 cursor-help">
                        <div className="w-48 text-sm text-gray-400">{f}</div>
                        <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div className="h-full rounded-full" style={{width: `${(v/3)*100}%`, background: SEV_CLR(v)}} />
                        </div>
                        <div className="w-10 text-right text-xs font-mono text-gray-300">{v.toFixed(2)}</div>
                        <div className="w-14 text-xs text-right" style={{color: SEV_CLR(v)}}>{SEV(v)}</div>
                      </div>
                    </HoverTip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Diagnostické profily</h3>
          <p className="text-xs text-gray-500 mb-6">Orientační mapování — nenahrazuje klinické hodnocení.</p>
          <div className="mb-6 p-4 rounded-xl bg-gray-800/40 border border-gray-700/30">
            <div className="space-y-1">
              {diagnostics.map(d => (
                <HoverTip key={d.id} text={DIAG_EXPLANATIONS[d.id]} wide>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.flag ? d.color : '#374151' }} />
                    <div className="w-44 text-xs truncate" style={{ color: d.flag ? d.color : '#6B7280' }}>{d.name.split('(')[0].trim()}</div>
                    <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(d.score/3)*100}%`, background: d.color, opacity: d.flag ? 1 : 0.4 }} />
                    </div>
                    <div className="w-10 text-right text-xs font-mono" style={{ color: d.flag ? d.color : '#6B7280' }}>{d.score.toFixed(2)}</div>
                    <div className="w-16 text-right text-xs" style={{ color: d.flag ? d.color : '#4B5563' }}>{d.flag ? '⚠ Zvýšené' : d.score >= 1.0 ? 'Mírné' : 'Nízké'}</div>
                  </div>
                </HoverTip>
              ))}
            </div>
          </div>
          {diagnostics.filter(d => d.flag).length > 0 && <div className="mb-4"><div className="text-sm font-semibold text-gray-400 mb-3">⚠ Zvýšené profily:</div>{diagnostics.filter(d => d.flag).map(d => <DiagCard key={d.id} diag={d} fScores={facetScores} />)}</div>}
          {diagnostics.filter(d => !d.flag && d.score >= 0.8).length > 0 && <div className="mb-4"><div className="text-sm font-semibold text-gray-500 mb-3">Subklinické:</div>{diagnostics.filter(d => !d.flag && d.score >= 0.8).map(d => <DiagCard key={d.id} diag={d} fScores={facetScores} />)}</div>}
        </div>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">�� Export výsledků</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => exportPid5Report(domainScores, facetScores, diagnostics, DF)} className="p-4 rounded-xl bg-purple-900/40 border border-purple-500/30 hover:border-purple-400/60 transition-all text-left">
              <div className="text-sm font-semibold text-purple-300">📄 Plný report</div>
              <div className="text-xs text-gray-500 mt-1">HTML s tiskem do PDF</div>
            </button>
            <button onClick={() => exportInstagramStory(domainScores, diagnostics)} className="p-4 rounded-xl bg-pink-900/40 border border-pink-500/30 hover:border-pink-400/60 transition-all text-left">
              <div className="text-sm font-semibold text-pink-300">📱 Insta Story</div>
              <div className="text-xs text-gray-500 mt-1">1080×1920 vizuální karta</div>
            </button>
            <button onClick={() => exportQuickSummary(domainScores, facetScores, diagnostics, DF)} className="p-4 rounded-xl bg-amber-900/40 border border-amber-500/30 hover:border-amber-400/60 transition-all text-left">
              <div className="text-sm font-semibold text-amber-300">⚡ Rychlý přehled</div>
              <div className="text-xs text-gray-500 mt-1">Kompaktní shrnutí</div>
            </button>
            <button onClick={() => exportRawJson({ domeny: domainScores, facety: facetScores, diagnostika: diagnostics.map(d => ({id:d.id,name:d.name,score:d.score,flag:d.flag})), odpovedi: answers }, 'pid5_vysledky.json')} className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:border-gray-600/60 transition-all text-left">
              <div className="text-sm font-semibold text-gray-300">🔧 JSON</div>
              <div className="text-xs text-gray-500 mt-1">Surová data</div>
            </button>
          </div>
        </div>

        <button onClick={() => setMode("menu")} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all mb-12">← Menu</button>
      </div>
    </div>
  );

  // ── LPFS RESULTS ──
  if (mode === "lpfs_results") return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setMode("menu")} className="text-gray-500 hover:text-gray-300 mb-6 text-sm">← Zpět</button>
        <h2 className="text-3xl font-bold text-blue-300 mb-2">LPFS-SR — Výsledky</h2>
        <p className="text-gray-400 mb-8">Vyplněno {Object.keys(lpfsAns).length}/80 položek</p>
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 backdrop-blur-xl mb-6">
          <div className="text-center">
            <div className="text-6xl font-bold" style={{color: SEV_CLR(lpfsTotal)}}>{lpfsTotal.toFixed(2)}</div>
            <div className="text-gray-400 mt-2">Průměrné skóre (škála 1–4)</div>
            <div className="text-lg mt-1" style={{color: SEV_CLR(lpfsTotal)}}>{SEV(lpfsTotal)}</div>
          </div>
        </div>
        {/* Subscales */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 backdrop-blur-xl mb-6">
          <h3 className="text-sm font-semibold text-blue-300 mb-4">Subškály</h3>
          {Object.entries(lpfsSubscaleScores).map(([sub, v]) => (
            <div key={sub} className="flex items-center gap-3 mb-3">
              <div className="w-32 text-sm font-medium text-blue-200">{LPFS_SUBSCALE_NAMES[sub]}</div>
              <div className="flex-1 bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{width: `${(v/4)*100}%`}} />
              </div>
              <div className="w-10 text-right text-sm font-mono text-gray-300">{v.toFixed(2)}</div>
            </div>
          ))}
          <div className="border-t border-gray-700/30 pt-3 mt-3 flex gap-4 text-xs">
            <span className="text-purple-400">Sebe-fungování: {((lpfsSubscaleScores.identity + lpfsSubscaleScores.selfDirection) / 2).toFixed(2)}</span>
            <span className="text-pink-400">Interpersonální: {((lpfsSubscaleScores.empathy + lpfsSubscaleScores.intimacy) / 2).toFixed(2)}</span>
          </div>
        </div>
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 backdrop-blur-xl mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">📥 Export</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => exportLpfsReport(lpfsTotal, lpfsAns, lpfsSubscaleScores)} className="p-3 rounded-xl bg-blue-900/40 border border-blue-500/30 hover:border-blue-400/60 transition-all text-left">
              <div className="text-sm font-semibold text-blue-300">📄 Report</div>
              <div className="text-xs text-gray-500">HTML/PDF se subškálami</div>
            </button>
            <button onClick={() => exportRawJson({ prumer: lpfsTotal, subskaly: lpfsSubscaleScores, odpovedi: lpfsAns }, 'lpfs_vysledky.json')} className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:border-gray-600/60 transition-all text-left">
              <div className="text-sm font-semibold text-gray-300">🔧 JSON</div>
              <div className="text-xs text-gray-500">Surová data</div>
            </button>
          </div>
        </div>
        <button onClick={() => setMode("menu")} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all">← Menu</button>
      </div>
    </div>
  );

  // ═══ QUESTIONNAIRE UI ═══
  const isPid = mode === "pid5";
  const curQ = isPid ? Q : LPFS_Q;
  const curI = isPid ? idx : lpfsIdx;
  const setCurI = isPid ? setIdx : setLpfsIdx;
  const curA = isPid ? answers : lpfsAns;
  const optLabels = isPid ? ["0 — Zcela nepravdivé", "1 — Částečně nepravdivé", "2 — Částečně pravdivé", "3 — Zcela pravdivé"] : ["1 — Zcela nepravdivé", "2 — Trochu pravdivé", "3 — Převážně pravdivé", "4 — Zcela pravdivé"];
  const optValues = isPid ? [0,1,2,3] : [1,2,3,4];
  const facets = isPid ? (REVERSE[curI] || []) : [];
  const domain = facets.length ? facetDomain(facets[0]) : null;
  const progress = (answered / (isPid ? Q.length : LPFS_Q.length)) * 100;
  const liveDiags = hoveredVal !== null ? previewDiagnostics : diagnostics;
  const questionHint = getQuestionHint(mode, curI, facets);
  const lpfsSub = !isPid ? getLpfsSubscale(curI) : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <AuthModal />
      {/* Progress */}
      <div className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <button onClick={() => setMode("menu")} className="hover:text-gray-300">← Menu</button>
            <span>{answered}/{isPid ? Q.length : LPFS_Q.length}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${isPid ? 'bg-purple-500' : 'bg-blue-500'}`} style={{width: `${progress}%`}} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center p-4 gap-4">
        <div className="w-full max-w-lg">
          {/* Domain / subscale tag */}
          {isPid && domain && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {facets.map(f => (
                <HoverTip key={f} text={FACET_META[f]?.desc}>
                  <span className="text-xs px-2.5 py-1 rounded-full border cursor-help" style={{borderColor: DC[domain] + '60', color: DC[domain], background: DC[domain] + '15'}}>{f}</span>
                </HoverTip>
              ))}
            </div>
          )}
          {!isPid && lpfsSub && (
            <div className="flex gap-2 mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full border border-blue-500/40 text-blue-300 bg-blue-500/10">
                {LPFS_SUBSCALE_NAMES[lpfsSub]}
              </span>
            </div>
          )}

          <div className={`rounded-2xl border p-6 md:p-8 backdrop-blur-xl ${isPid ? 'bg-purple-950/30 border-purple-500/20' : 'bg-blue-950/30 border-blue-500/20'}`}>
            <div className="text-gray-500 text-sm mb-3 font-mono">#{curI + 1}</div>
            <p className="text-lg md:text-xl font-medium leading-relaxed mb-4 text-gray-100">{curQ[curI]}</p>

            {/* Question hint */}
            {questionHint && (
              <div className="mb-6">
                <button onClick={() => setShowHint(!showHint)} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
                  <span>💡</span> {showHint ? 'Skrýt nápovědu' : 'Nápověda k otázce'}
                </button>
                {showHint && (
                  <div className="mt-2 p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 text-xs" style={{animation: 'fadeIn .2s ease-out'}}>
                    <p className="text-gray-300 mb-1">{questionHint.hint}</p>
                    <p className="text-gray-500 italic">{questionHint.example}</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {optLabels.map((label, i) => {
                const val = optValues[i];
                const isSelected = curA[curI] === val;
                return (
                  <button key={i} onClick={() => answer(val)} onMouseEnter={() => setHoveredVal(val)} onMouseLeave={() => setHoveredVal(null)}
                    className={`p-4 rounded-xl text-left transition-all border font-medium text-sm ${isSelected ? (isPid ? 'bg-purple-600/40 border-purple-400/60 text-purple-200' : 'bg-blue-600/40 border-blue-400/60 text-blue-200') : 'bg-gray-900/40 border-gray-700/40 text-gray-300 hover:border-gray-500/60 hover:bg-gray-800/40'}`}>
                    <span className="inline-flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 rounded bg-gray-700/60 text-gray-400 text-xs font-mono border border-gray-600/40">{val}</kbd>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ LPFS Live Dashboard ═══ */}
          {!isPid && (
            <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-950/20 backdrop-blur-xl p-4">
              <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  Průběžné skóry LPFS
                </span>
                <span className="text-gray-600">{Object.keys(lpfsAns).length}/80</span>
              </div>
              {/* Total */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-800">
                <div className="w-20 text-xs font-medium text-blue-300">Celkem</div>
                <div className="flex-1 bg-gray-800 rounded-full h-2.5 overflow-hidden relative">
                  <div className="absolute inset-0 h-full rounded-full transition-all" style={{width: `${(lpfsTotal/4)*100}%`, background: SEV_CLR(lpfsTotal), opacity: previewLpfsTotal !== null ? 0.4 : 1}} />
                  {previewLpfsTotal !== null && <div className="absolute inset-0 h-full rounded-full transition-all duration-200" style={{width: `${(previewLpfsTotal/4)*100}%`, background: SEV_CLR(previewLpfsTotal)}} />}
                </div>
                <div className="w-10 text-right text-sm font-mono font-bold" style={{color: SEV_CLR(previewLpfsTotal ?? lpfsTotal)}}>{(previewLpfsTotal ?? lpfsTotal).toFixed(2)}</div>
                {previewLpfsTotal !== null && (() => { const diff = previewLpfsTotal - lpfsTotal; return <div className={`w-12 text-right text-xs font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-700'}`}>{diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : '—'}</div>; })()}
              </div>
              {/* Subscales */}
              {Object.entries(previewLpfsSubscales).map(([sub, v]) => {
                const base = lpfsSubscaleScores[sub] || 0;
                const diff = previewLpfsTotal !== null ? v - base : 0;
                return (
                  <div key={sub} className="flex items-center gap-2 mb-1.5">
                    <div className="w-28 text-xs text-blue-200/70 truncate">{LPFS_SUBSCALE_NAMES[sub]}</div>
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden relative">
                      <div className="absolute inset-0 h-full rounded-full" style={{width: `${(base/4)*100}%`, background: '#60A5FA', opacity: previewLpfsTotal !== null ? 0.4 : 1}} />
                      {previewLpfsTotal !== null && <div className="absolute inset-0 h-full rounded-full transition-all duration-200" style={{width: `${(v/4)*100}%`, background: '#60A5FA'}} />}
                    </div>
                    <div className="w-10 text-right text-xs font-mono text-gray-400">{v.toFixed(2)}</div>
                    <div className={`w-12 text-right text-xs font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-700'}`}>
                      {diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PID-5 Live domain dashboard */}
          {isPid && (
            <div className="mt-4 rounded-2xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-xl p-4">
              <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />Průběžné skóry</span>
                <span className="text-gray-600">{Object.keys(answers).length}/220</span>
              </div>
              <div className="space-y-2 mb-3">
                {Object.entries(hoveredVal !== null ? previewDomainScores : domainScores).map(([d, v]) => {
                  const base = domainScores[d] || 0;
                  const diff = hoveredVal !== null ? v - base : 0;
                  return (
                    <HoverTip key={d} text={DOMAIN_META[d]?.desc}>
                      <div className="flex items-center gap-2 cursor-help">
                        <div className="w-28 text-xs font-medium truncate" style={{color: DC[d]}}>{d}</div>
                        <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden relative">
                          <div className="absolute inset-0 h-full rounded-full transition-all duration-300" style={{width: `${(base/3)*100}%`, background: DC[d], opacity: hoveredVal !== null ? 0.4 : 1}} />
                          {hoveredVal !== null && <div className="absolute inset-0 h-full rounded-full transition-all duration-200" style={{width: `${(v/3)*100}%`, background: DC[d]}} />}
                        </div>
                        <div className="w-10 text-right text-xs font-mono text-gray-300">{v.toFixed(2)}</div>
                        <div className={`w-12 text-right text-xs font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-700'}`}>{diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : '—'}</div>
                      </div>
                    </HoverTip>
                  );
                })}
              </div>
              {facets.length > 0 && (
                <div className="border-t border-gray-800 pt-2 space-y-1">
                  <div className="text-xs text-gray-600 mb-1">Facety této otázky:</div>
                  {facets.map(f => {
                    const displayScores = hoveredVal !== null ? previewFacetScores : facetScores;
                    const v = displayScores[f] || 0;
                    const base = facetScores[f] || 0;
                    const diff = hoveredVal !== null ? v - base : 0;
                    return (
                      <HoverTip key={f} text={FACET_META[f]?.desc}>
                        <div className="flex items-center gap-2 cursor-help">
                          <div className="w-28 text-xs text-gray-400 truncate">↳ {f}</div>
                          <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden relative">
                            <div className="absolute inset-0 h-full rounded-full transition-all duration-300" style={{width: `${(base/3)*100}%`, background: SEV_CLR(base), opacity: hoveredVal !== null ? 0.4 : 1}} />
                            {hoveredVal !== null && <div className="absolute inset-0 h-full rounded-full transition-all duration-200" style={{width: `${(v/3)*100}%`, background: SEV_CLR(v)}} />}
                          </div>
                          <div className="w-10 text-right text-xs font-mono text-gray-400">{v.toFixed(2)}</div>
                          <div className={`w-12 text-right text-xs font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-700'}`}>{diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : '—'}</div>
                        </div>
                      </HoverTip>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PID-5 Live diagnostics */}
          {isPid && (
            <div className="mt-4 rounded-2xl border border-gray-700/30 bg-gray-900/40 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500 flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />Diagnostické profily — live</div>
                <button onClick={() => setShowDiagLive(!showDiagLive)} className="text-xs text-gray-600 hover:text-gray-400">{showDiagLive ? '▾ Sbalit' : '▸ Rozbalit'}</button>
              </div>
              {showDiagLive && (
                <div className="space-y-1">
                  {liveDiags.map(d => {
                    const baseDiag = diagnostics.find(x => x.id === d.id);
                    const diff = baseDiag && hoveredVal !== null ? d.score - baseDiag.score : 0;
                    return (
                      <HoverTip key={d.id} text={DIAG_EXPLANATIONS[d.id]}>
                        <div className="flex items-center gap-2 py-0.5 cursor-help">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.flag ? d.color : '#374151' }} />
                          <div className="w-32 text-xs truncate" style={{ color: d.flag ? d.color : '#6B7280' }}>{d.name.split('(')[0].split('—')[0].trim()}</div>
                          <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden relative">
                            <div className="absolute inset-0 h-full rounded-full transition-all duration-300" style={{ width: `${((baseDiag?.score || 0)/3)*100}%`, background: d.color, opacity: hoveredVal !== null ? 0.4 : 1 }} />
                            {hoveredVal !== null && <div className="absolute inset-0 h-full rounded-full transition-all duration-200" style={{ width: `${(d.score/3)*100}%`, background: d.color }} />}
                          </div>
                          <div className="w-10 text-right text-xs font-mono" style={{ color: d.flag ? d.color : '#6B7280' }}>{d.score.toFixed(2)}</div>
                          <div className={`w-10 text-right text-xs font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-700'}`}>{diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : ''}</div>
                        </div>
                      </HoverTip>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Scoring Info panel — kept compact */}
          <div className="mt-4">
            <button onClick={() => setShowScoringInfo(!showScoringInfo)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs transition-all border ${showScoringInfo ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' : 'bg-gray-900/40 border-gray-700/30 text-gray-500 hover:text-gray-400 hover:border-gray-600'}`}>
              <span className="flex items-center gap-2"><span>{showScoringInfo ? '📖' : '📐'}</span>Zdroje & vzorečky</span>
              <span>{showScoringInfo ? '▾ Skrýt' : '▸ Zobrazit'}</span>
            </button>
            {showScoringInfo && (
              <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-950/10 backdrop-blur-xl p-4 space-y-3 text-xs">
                <div>
                  <div className="text-amber-300 font-semibold mb-1.5">📊 Skórování</div>
                  <div className="text-gray-400 space-y-1">
                    <p>• <span className="text-gray-300">Škála:</span> {isPid ? SCORING_INFO.pid5.scale : SCORING_INFO.lpfs.scale}</p>
                    {isPid ? <>
                      <p>• <span className="text-gray-300">Faceta:</span> {SCORING_INFO.pid5.facetFormula}</p>
                      <p>• <span className="text-gray-300">Doména:</span> {SCORING_INFO.pid5.domainFormula}</p>
                      <p>• <span className="text-gray-300">Diagnostika:</span> {SCORING_INFO.pid5.diagFormula}</p>
                    </> : <>
                      <p>• <span className="text-gray-300">Celkem:</span> {SCORING_INFO.lpfs.totalFormula}</p>
                      <p>• <span className="text-gray-300">Subškály:</span> {SCORING_INFO.lpfs.subscales}</p>
                    </>}
                  </div>
                </div>
                {isPid && facets.length > 0 && (
                  <div>
                    <div className="text-amber-300 font-semibold mb-1.5">🧩 Facety otázky #{curI + 1}</div>
                    {facets.map(f => { const meta = FACET_META[f]; if (!meta) return null; const src = SOURCES[meta.source]; return (
                      <div key={f} className="mb-2 p-2 rounded-lg bg-gray-900/40 border border-gray-700/20">
                        <div className="font-semibold text-gray-200">{f} <span className="text-gray-600">({meta.en})</span></div>
                        <p className="font-mono text-[11px] text-amber-400/80 bg-black/30 rounded px-2 py-1 mt-1">{meta.formulaExact}</p>
                        <p className="text-gray-500 mt-1">📚 {src?.url ? <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-400/70 hover:text-blue-300 underline underline-offset-2">{src.short}</a> : meta.source}</p>
                      </div>
                    ); })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-4">
            <button onClick={() => setCurI(Math.max(0, curI - 1))} disabled={curI === 0} className="text-sm text-gray-500 hover:text-gray-300 disabled:opacity-30">← Předchozí</button>
            <div className="flex gap-1">
              {Array.from({length: Math.min(10, Math.ceil((curI+1)/10)*10) - Math.floor(curI/10)*10}, (_, j) => {
                const n = Math.floor(curI / 10) * 10 + j;
                if (n >= curQ.length) return null;
                const has = curA[n] !== undefined;
                return <button key={n} onClick={() => setCurI(n)} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center transition-all ${n === curI ? (isPid ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white') : has ? 'bg-gray-700 text-gray-300' : 'bg-gray-800/50 text-gray-600'}`}>{n+1}</button>;
              })}
            </div>
            <button onClick={() => setCurI(Math.min(curQ.length - 1, curI + 1))} disabled={curI >= curQ.length - 1} className="text-sm text-gray-500 hover:text-gray-300 disabled:opacity-30">Další →</button>
          </div>

          {answered >= (isPid ? Q.length : LPFS_Q.length) && (
            <button onClick={() => setMode(isPid ? 'pid5_results' : 'lpfs_results')} className={`w-full mt-6 p-4 rounded-xl font-semibold text-lg transition-all ${isPid ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'}`}>Zobrazit výsledky</button>
          )}
        </div>
      </div>
    </div>
  );
}
