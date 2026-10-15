import type { StepId } from "./onboarding";
import { PRODUCTS_WITH_PACK, STEP_COPY } from "./onboarding";

/**
 * Hinglish (kickoff 3.10): the setup story and the daily notes, in the Roman-script mix many
 * people actually text in. Everything else stays in English. Same rules as the English copy:
 * short, kind, no doses, no dashes. Switch it in You, or on the welcome screen.
 */

export type Lang = "en" | "hinglish";

const STEP_COPY_HI: Record<StepId, { title: string; turn: string; chapter: string; skip?: string }> = {
  name: { chapter: "Aapka naam", title: "Aapko kya bulayein?", turn: "Sirf greeting ke liye. Nickname bhi chalega." },
  age: { chapter: "Age", title: "Aapki age kaunsi band mein hai?", turn: "Isse kuch tips badalte hain. Dose kabhi nahi.", skip: "Skip" },
  city: { chapter: "Aapki baarish", title: "Aap kis city mein ho?", turn: "Bas yeh jaanne ke liye ki baarish kab aati hai.", skip: "Skip" },
  products: { chapter: "Aapka routine", title: "Aap kya use kar rahe ho?", turn: "Taaki aapke din mein sahi cheezein dikhein." },
  channel: { chapter: "Kaise kharida", title: "Aapne yeh kaise kharida?", turn: "Agar kisi ne briefing nahi di, toh hum denge." },
  start: { chapter: "Day one", title: "Aapne kab shuru kiya?", turn: "Map pe sab kuch isi din se gina jaata hai." },
  worries: { chapter: "Aapki chinta", title: "Sabse zyada kya pareshaan karta hai?", turn: "Hum photos mein uspe nazar rakhenge.", skip: "Skip" },
  letter: { chapter: "Ek note", title: "Week five ke liye ek note likho.", turn: "Aapke apne shabd humare shabdon se zyada asar karenge.", skip: "Baad mein likhunga" },
  reminders: { chapter: "Reminders", title: "Reminders kab chahiye?", turn: "Taaki aapke din mein sahi time dikhe." },
};

const PRODUCTS_WITH_PACK_HI = { title: "Aapke pack pe yeh likha hai.", turn: "Kuch aur bhi use kar rahe ho?" };

/** A setup question in the chosen language. With a pack scanned, the products step opens differently. */
export function stepCopy(step: StepId, lang: Lang, hasPack: boolean) {
  const base = lang === "hinglish" ? STEP_COPY_HI[step] : STEP_COPY[step];
  if (step === "products" && hasPack) return { ...base, ...(lang === "hinglish" ? PRODUCTS_WITH_PACK_HI : PRODUCTS_WITH_PACK) };
  return base;
}

/** One Hinglish line per insight card, by id. {w} and {restart} are filled in like the English. */
export const INSIGHTS_HI: Record<string, string> = {
  "calm-day-one": "Day one. Clock shuru ho gaya. Kuch time tak kuch alag nahi dikhega, aur yahi plan hai.",
  "calm-photo-remembers": "Abhi dikhne ko kuch nahi hai, aur yahi plan hai. Yaad rakhne ka kaam aapki photo kar rahi hai.",
  "calm-no-baseline": "Aapne abhi tak day-one photos nahi li hain. Do minute lagenge, aur is mahine ka sabse kaam ka kaam yahi hai.",
  "calm-habit": "Abhi ka mushkil hissa boring hai: roz pack pe likhe time pe lagana. Ise kisi aisi cheez se jodo jo aap kabhi miss nahi karte.",
  "calm-roots": "Yeh roots pe kaam karta hai, dikhne waale baalon pe nahi. Aaj jo baal sar pe hain, woh mahino pehle ugna shuru hue the.",
  "calm-heads-up": "Heads up. Agle kuch hafton mein bahut log shower mein zyada baal dekhte hain. Agar aisa ho, toh yeh expected hai.",
  "calm-letter-unwritten": "Week five ke liye apne aap ko do line likh do. Wahan pahunchoge toh samajh aayega kyun.",
  "calm-quick-commerce": "Aapne yeh das minute mein kharida, toh kisi ne briefing nahi di. Short mein: shed expect karo, judge chhe mahine pe karo.",
  "shed-open": "Ab aap shed window mein ho. Agle kuch hafton mein zyada baal girna wahi pattern hai jo zyaadatar log batate hain.",
  "shed-high": "Yeh shed window hai. Agar abhi zyada baal gir rahe hain, toh yahi pattern zyaadatar log batate hain. Compare karne ke liye yeh rahi aapki day-one photo.",
  "shed-why": "Shed hota hi kyun hai? Purane resting baal naye ugne waale baalon ke liye jagah banaate hain. Purana jaata hai, dheere dheere.",
  "shed-week-five": "Week five. Zyaadatar logon ke liye sabse mushkil hafta, aur jab bahut log chhod dete hain. Aap abhi bhi yahan ho.",
  "shed-letter-ready": "Kuch hafte pehle aapne is hafte ke liye kuch likha tha. Padhna hai?",
  "shed-monsoon": "Do shed ek saath chal rahe hain. Isme season ka bhi haath hai, sirf bottle ka nahi.",
  "shed-seasonal-peak": "Late summer aur autumn mein zyaadatar logon ke baal zyada girte hain, treatment ho ya na ho. Isme thoda calendar ka bhi haath hai.",
  "shed-counting": "Takiye pe baal ginna apna mood kharab karne ka pakka tareeka hai. Aapki photos woh naapti hain jo asal mein matter karta hai.",
  "shed-other-people": "Agar kisi ne haal mein aapke baalon pe comment kiya hai, toh woh week five dekh rahe hain, month six nahi. Aap unhe plan dikha sakte ho.",
  "shed-cohort": "Jinhone aapke saath shuru kiya, unme se bahut log abhi isi stretch mein hain. Yeh hissa kisi ko pasand nahi.",
  "shed-quiet": "Shaant hafta. Har kisi ka zyada shed nahi hota, aur yeh bhi theek hai. Chhota shed matlab yeh nahi ki kaam nahi kar raha.",
  "shed-photo-week-four": "Pehla monthly photo day. Wahi jagah, wahi roshni, day one jaisa hi time. Abhi koi dikhne waala change expect mat karo.",
  "shed-peak": "Bahut logon ke liye shed abhi peak pe hota hai aur phir kam hota hai. Aap is hisse ke shuru se zyada end ke paas ho.",
  "shed-more-isnt-faster": "Jaldi result ke liye zyada lagane ka mann hai? Zyada lagane se jaldi nahi hota, aur scalp irritate ho sakta hai. Pack pe jo likha hai wahi karo.",
  "shed-kept-going": "Is hafte aapne chhodne ka socha aur phir bhi chalte rahe. Wahi mushkil hissa tha.",
  "settle-open": "Shed window band ho rahi hai. Bahut logon ke liye agle kuch hafton mein baal girna kam hota hai.",
  "settle-photo-week-eight": "Aaj raat week eight ki photos. Day one se compare karo, kal se nahi.",
  "settle-boring": "Yeh hissa boring hai. Boring achha hai. Abhi kuch dramatic hona hi nahi hai.",
  "settle-still-heavy": "Week eight ke baad bhi bahut shed ho raha hai? Settle hone mein time lag sakta hai, khaaskar baarish ke season mein. Agar week twelve tak bhi heavy hai, toh doctor se baat karo.",
  "settle-halfway": "Judgement day tak aadha raasta. Aadha intezaar ho gaya, aur kuch bhi bekaar nahi gaya.",
  "fine-week-twelve": "Week twelve ki photos. Kuch logon ko thoda dikhta hai, bahut logon ko abhi kuch nahi. Dono schedule pe hain.",
  "fine-hairs": "Pehle patle baal aksar isi time dikhte hain. Aaj raat photos dobara lo.",
  "fine-growth-rate": "Baal mahine mein lagbhag ek centimetre badhte hain. Naye baalon ko notice hone layak lambe hone mein kuch mahine lagte hain.",
  "fine-not-late": "Agar abhi farak nahi dikh raha, toh aap late nahi ho. Judge karne ka sahi time week 24 ke aas paas hai.",
  "fine-week-sixteen": "Week sixteen ki photos. Aksar yahi pehla comparison hota hai jahan log kuch notice karte hain.",
  "build-long-middle": "Lamba beech ka hissa. Month five pe koi gaane nahi likhta. Phir bhi chalte raho.",
  "build-week-twenty": "Week twenty ki photos. Iske baad ek set aur, phir aap theek se judge kar paoge.",
  "build-almost": "Judgement day mein do hafte. Ek proper photo session plan karo: wahi jagah, wahi roshni, koi jaldi nahi.",
  "build-consistency": "Paanch mahine se lagataar. Yeh consistency hi zyaadatar kaam hai.",
  "judge-day": "Week 24. Ab imaandari se judge karne ka time: day one aur aaj ek saath. Agar samajh na aaye ki kya dikh raha hai, toh doctor aapke saath dekh sakta hai.",
  "beyond-keep": "Bahut log chhe mahine ke baad bhi chalu rakhte hain, kyunki poora asar dikhne mein saal ke kareeb lag sakta hai.",
  "missed-few": "Kuch din miss ho gaye? Hota hai. Aaj raat se phir shuru karo. Na catch up, na double, bas chalte raho.",
  "missed-many": "Thode time ke liye life beech mein aa gayi. Dobara shuru karoge toh shayad phir se chhota shed dikhe. Yeh normal hai, peeche jaana nahi.",
  "night-worry": "Raat ho gayi hai, aur is time baal hamesha bure dikhte hain. Ek minute circle ke saath saans lo. Din ki roshni mein dobara dekhna.",
  "restart-after-pause": "Welcome back. Dobara shuru karne pe ek doosra, chhota shed aa sakta hai. Wahi process, nayi problem nahi.",
  "no-checkin-week": "Ek hafte se check-in nahi hua. Tees second, neeche waala bar.",
  "photo-overdue": "Aapki week {w} ki photos kuch din late hain. Aaj raat bhi chalega. Wahi jagah, wahi roshni.",
  "roller-night": "Aaj roller night hai. Ise aaj apne solution se alag rakhna. Timing aapke Today card pe hai.",
  "gummies-food": "Gummies khaane ke saath behtar baithti hain. Breakfast sabse aasaan anchor hai.",
  "red-irritation": "Aapne dard, jalan ya rash bataya. Agli baar lagane se pehle please doctor se baat karo. Unhe yeh list dikhana.",
  "red-systemic": "Chakkar, dil ki tez dhadkan, ya chehre, haathon ya pairon mein sujan ke liye aaj hi doctor chahiye. Agle check-in ka intezaar mat karo.",
  "red-late-heavy": "Itne time baad bhi heavy shedding usual pattern nahi hai. Doctor ka appointment le lo taaki koi theek se dekh sake.",
  "red-other": "Aapne kuch alag notice kiya. Us pe bharosa karo. Doctor bata sakta hai ki iska isse koi lena dena hai ya nahi.",
  "paused-now": "Aap {restart} tak paused ho. Aapka map apni jagah pe hai, aur day one, day one hi rahega.",
  fallback: "Ek din, ek baar. Map ban chuka hai; bas chalte rehna hai.",
  "not-started": "Aapka plan abhi shuru nahi hua. Pehli application se pehle day-one photos le lo, phir clock ko chalne do.",
};

/** Welcome screen language switch. */
export const LANG_SWITCH = { label: "Setup in", en: "English", hinglish: "Hinglish" };
