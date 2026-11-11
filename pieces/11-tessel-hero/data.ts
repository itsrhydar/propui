// One morning in Tessel for an invented wool shop. Every card, thread and row reads from here.

/** What the product looks like on its card: a knitted swatch or a glazed surface, drawn in SVG. */
export type Look = { kind: "knit"; stitch: "plain" | "cable" | "rib"; yarn: [string, string, string] } | { kind: "glaze"; glaze: [string, string, string] };
export type Draft = { id: string; title: string; before?: string; body: string; lang: string; words: number; voice: number; look: Look };
export type Thread = { id: string; title: string; when: string; prompt: string; intro: string; drafts: Draft[] };

export const SHOP = { name: "Northwick Wool Co.", initials: "NW" };

export const THREADS: Thread[] = [
  {
    id: "knit-nl",
    title: "Autumn knitwear, Dutch store",
    when: "09:12",
    prompt: "Rewrite the autumn knitwear range for our Dutch store. Warm but plain, under 90 words each, using @Brand voice v3.",
    intro: "Here are the first three of 24 products, in Dutch.",
    drafts: [
      { id: "k1", title: "Visserstrui, gebroken wit", body: "Een dikke visserstrui van Shetlandwol, gebreid in Schotland. Warm genoeg voor de pier in november, zacht genoeg voor op de bank. Valt ruim; kies je gewone maat.", lang: "NL", words: 64, voice: 96, look: { kind: "knit", stitch: "cable", yarn: ["#efe7d6", "#d6c9b0", "#fbf6ea"] } },
      { id: "k2", title: "Kabelvest, mosgroen", body: "Een vest met een klassieke kabelsteek en hoornen knopen. Recht en ruim gesneden, zodat er makkelijk een overhemd onder past. Met de hand te wassen.", lang: "NL", words: 58, voice: 94, look: { kind: "knit", stitch: "cable", yarn: ["#7d8a5a", "#5d6a42", "#a2ad7c"] } },
      { id: "k3", title: "Muts van lamswol, roest", body: "Een muts van zachte lamswol in een warme roesttint. Dubbel gebreid aan de rand, dus je oren blijven droog op een natte fietstocht.", lang: "NL", words: 41, voice: 95, look: { kind: "knit", stitch: "rib", yarn: ["#b4552c", "#8d3d1c", "#d27a4d"] } },
    ],
  },
  {
    id: "cer-titles",
    title: "Ceramics, shorter titles",
    when: "Yesterday",
    prompt: "Shorten every title in the ceramics range to five words or fewer. Keep the glaze names.",
    intro: "Three of 18 titles, shortened. The glaze names stay.",
    drafts: [
      { id: "c1", title: "Ochre stoneware mug, 300 ml", before: "Hand-thrown stoneware coffee mug in speckled ochre glaze, 300ml", body: "Same mug, same glaze. The size moves to the end so the title reads in one glance on mobile.", lang: "EN", words: 5, voice: 92, look: { kind: "glaze", glaze: ["#c98a2e", "#8f5a17", "#f0c46e"] } },
      { id: "c2", title: "Celadon side plate", before: "Small handmade side plate with a soft celadon glaze for everyday use", body: "Dropped 'handmade' and 'everyday use': both are said in the first line of the description already.", lang: "EN", words: 3, voice: 90, look: { kind: "glaze", glaze: ["#a9c3a4", "#7d9a7a", "#d7e6cf"] } },
      { id: "c3", title: "Tenmoku serving bowl, large", before: "Large wheel-thrown serving bowl finished in a deep tenmoku glaze", body: "Kept 'large' because the range has three bowl sizes and buyers filter by it.", lang: "EN", words: 4, voice: 93, look: { kind: "glaze", glaze: ["#4a2a1c", "#22130c", "#8a5232"] } },
    ],
  },
  {
    id: "gift-intros",
    title: "Gift guide intros",
    when: "Mon",
    prompt: "Write a two-line intro for each gift guide, under £50, under £100 and for walkers.",
    intro: "Three intros, two lines each.",
    drafts: [
      { id: "g1", title: "Under £50", body: "Socks that last a winter, a hat that survives the dog walk, a scarf that goes with everything. Small things people actually wear.", lang: "EN", words: 24, voice: 95, look: { kind: "knit", stitch: "plain", yarn: ["#8c6d9e", "#6b5079", "#b097c0"] } },
      { id: "g2", title: "Under £100", body: "The jumper they keep borrowing from you, in their own size this time. Knitted in Scotland, posted in two days.", lang: "EN", words: 21, voice: 94, look: { kind: "knit", stitch: "cable", yarn: ["#3f5a78", "#2c4058", "#6f8bab"] } },
      { id: "g3", title: "For walkers", body: "Wool keeps you warm when it is wet, which is most of the walk. Start with socks, then the hat, then the gaiter.", lang: "EN", words: 24, voice: 96, look: { kind: "knit", stitch: "rib", yarn: ["#9a7b56", "#76593a", "#c3a37a"] } },
    ],
  },
];

/** What a new prompt returns: the next range in the shop, so typing anything still shows real copy. */
export const NEXT_DRAFTS: Draft[] = [
  { id: "n1", title: "Merino base layer, charcoal", body: "A thin merino layer that sits under a shirt without bunching. Warm on the platform, cool on the train, and it does not hold on to smells.", lang: "EN", words: 29, voice: 95, look: { kind: "knit", stitch: "plain", yarn: ["#4b4b4f", "#323236", "#76767c"] } },
  { id: "n2", title: "Walking socks, heather", body: "Thick in the heel and toe, thinner over the top of the foot so your boots still lace. A pair lasts most of a winter of weekend walks.", lang: "EN", words: 30, voice: 94, look: { kind: "knit", stitch: "rib", yarn: ["#a07d93", "#7c5b70", "#c7a4b9"] } },
  { id: "n3", title: "Fingerless gloves, oat", body: "For cold desks and early bus stops. Long enough to cover the wrist, short enough to type in. Lambswool, knitted on the same machines as the hats.", lang: "EN", words: 30, voice: 93, look: { kind: "knit", stitch: "plain", yarn: ["#d8c6a4", "#b9a57f", "#efe2c6"] } },
];

export const MODELS = [
  { id: "large", name: "Tessel Large", note: "Best for brand voice and long copy" },
  { id: "fast", name: "Tessel Fast", note: "Titles, tags and short fields" },
  { id: "trans", name: "Tessel Translate", note: "Keeps your voice across 14 languages" },
];

export const CATALOGUE = [
  { name: "Visserstrui, gebroken wit", status: "In review", langs: "EN NL DE", updated: "Today" },
  { name: "Kabelvest, mosgroen", status: "In review", langs: "EN NL", updated: "Today" },
  { name: "Ochre stoneware mug", status: "Live", langs: "EN", updated: "Yesterday" },
  { name: "Celadon side plate", status: "Live", langs: "EN FR", updated: "Yesterday" },
  { name: "Walking socks, heather", status: "Draft", langs: "EN", updated: "Mon" },
  { name: "Lambswool hat, rust", status: "Live", langs: "EN NL DE FR", updated: "Mon" },
];

export const VOICE = [
  { rule: "Say what it is made of before how it feels.", eg: "“Shetland wool, knitted in Scotland.”" },
  { rule: "Plain words over adjectives. One per sentence at most.", eg: "“Warm enough for the pier in November.”" },
  { rule: "Tell people how it fits, not that it is flattering.", eg: "“Falls loose; take your usual size.”" },
  { rule: "No exclamation marks, no ‘elevate’, no ‘must-have’.", eg: "" },
];

export const LOGOS = ["Northwick", "marlo&fen", "OKKO", "Brightloom", "Saltmarsh", "pellet.", "Viridian"];
