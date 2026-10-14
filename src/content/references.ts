/** Sources cited by insight cards and the About page. From HANDOFF.md section 12. */
export const REFERENCES = [
  { key: "kaliyadan2013", short: "Kaliyadan et al. 2013", citation: "Kaliyadan et al., \"Androgenetic Alopecia: An Update,\" Indian Journal of Dermatology, Venereology and Leprology 79(5), 2013." },
  { key: "shadi2023", short: "Shadi 2023", citation: "Shadi, \"Compliance to Topical Minoxidil and Reasons for Discontinuation among Patients with Androgenetic Alopecia,\" Dermatology and Therapy 13(5), 2023." },
  { key: "oliver1980", short: "Oliver 1980", citation: "Oliver, \"A Cognitive Model of the Antecedents and Consequences of Satisfaction Decisions,\" Journal of Marketing Research 17(4), 1980." },
  { key: "kahneman1979", short: "Kahneman and Tversky 1979", citation: "Kahneman and Tversky, \"Prospect Theory,\" Econometrica 47(2), 1979." },
  { key: "odonoghue1999", short: "O'Donoghue and Rabin 1999", citation: "O'Donoghue and Rabin, \"Doing It Now or Later,\" American Economic Review 89(1), 1999." },
  { key: "kivetz2006", short: "Kivetz et al. 2006", citation: "Kivetz, Urminsky and Zheng, \"The Goal-Gradient Hypothesis Resurrected,\" Journal of Marketing Research 43(1), 2006." },
  { key: "kunz2009", short: "Kunz et al. 2009", citation: "Kunz et al., \"Seasonality of Hair Shedding in Healthy Women Complaining of Hair Loss,\" Dermatology 219(2), 2009." },
  { key: "hsiang2018", short: "Hsiang et al. 2018", citation: "Hsiang et al., \"Seasonality of Hair Loss: A Time Series Analysis of Google Trends Data 2004 to 2016,\" British Journal of Dermatology 178(4), 2018." },
  { key: "taylor1978", short: "Taylor and Fiske 1978", citation: "Taylor and Fiske, \"Salience, Attention, and Attribution: Top of the Head Phenomena,\" Advances in Experimental Social Psychology 11, 1978." },
  { key: "cialdini1984", short: "Cialdini 1984", citation: "Cialdini, Influence: The Psychology of Persuasion, 1984." },
  { key: "mcguire1961", short: "McGuire 1961", citation: "McGuire, \"Resistance to Persuasion Conferred by Active and Passive Prior Refutation of the Same and Alternative Counterarguments,\" Journal of Abnormal and Social Psychology 63(2), 1961." },
  { key: "bernstein", short: "Bernstein Medical", citation: "Bernstein Medical, \"Hair Growth\" (hair grows about a centimetre a month; resting hairs are replaced over roughly three to four months)." },
  { key: "aafp", short: "AAFP", citation: "AAFP Community Blog, \"Treatment of Hair Loss with Minoxidil\" (full effect closer to a year)." },
] as const;

export type ReferenceKey = (typeof REFERENCES)[number]["key"];
