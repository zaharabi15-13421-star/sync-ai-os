export const sparkData = (n = 12, base = 50) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    v: Math.round(base + Math.sin(i / 1.4) * 12 + Math.random() * 14),
  }));

export const revenueSeries = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  revenue: 32000 + i * 4200 + Math.round(Math.random() * 5000),
  spend: 12000 + i * 1100 + Math.round(Math.random() * 2200),
  forecast: i > 9 ? 32000 + i * 4900 + Math.round(Math.random() * 4000) : null,
}));

export const funnel = [
  { stage: "Impressions", value: 2_450_000 },
  { stage: "Clicks", value: 184_000 },
  { stage: "Visits", value: 142_500 },
  { stage: "Leads", value: 18_400 },
  { stage: "MQLs", value: 6_120 },
  { stage: "Sales", value: 1_840 },
];

export const competitors = [
  { metric: "Sentiment", us: 92, A: 71, B: 64, C: 80 },
  { metric: "Voice Share", us: 78, A: 62, B: 48, C: 70 },
  { metric: "Engagement", us: 88, A: 70, B: 55, C: 74 },
  { metric: "Innovation", us: 95, A: 60, B: 52, C: 68 },
  { metric: "Loyalty", us: 84, A: 66, B: 60, C: 72 },
  { metric: "Reach", us: 81, A: 75, B: 70, C: 78 },
];

export const sentimentBreakdown = [
  { name: "Positive", value: 68, color: "oklch(0.72 0.18 155)" },
  { name: "Neutral", value: 22, color: "oklch(0.65 0.02 260)" },
  { name: "Negative", value: 10, color: "oklch(0.65 0.25 20)" },
];

export const platforms = ["Meta", "Instagram", "TikTok", "Google Ads", "LinkedIn", "WhatsApp", "YouTube", "X / Twitter", "Pinterest", "Snapchat"];

export const leads = [
  { id: 1, name: "Aarav Hossain", company: "Nimbus Realty", score: 94, channel: "WhatsApp", stage: "Meeting Set", value: 24000 },
  { id: 2, name: "Sofia Martinez", company: "PulseClinic", score: 88, channel: "Instagram", stage: "Nurturing", value: 18000 },
  { id: 3, name: "James O'Connor", company: "EduForge", score: 76, channel: "LinkedIn", stage: "New", value: 9800 },
  { id: 4, name: "Ling Wei", company: "Bloom D2C", score: 91, channel: "Messenger", stage: "Nurturing", value: 32000 },
  { id: 5, name: "Rahim Ali", company: "Saffron Bistro", score: 67, channel: "WhatsApp", stage: "New", value: 5400 },
  { id: 6, name: "Emma Schmidt", company: "Pinnacle Group", score: 82, channel: "Email", stage: "Meeting Set", value: 41000 },
  { id: 7, name: "Diego Romero", company: "Vortex Auto", score: 73, channel: "Instagram", stage: "Closed", value: 28000 },
];

export const influencers = [
  { name: "Maya Chen", handle: "@mayacreates", niche: "Beauty", followers: "1.2M", authenticity: 96, fakePct: 3, roi: "4.8x", img: "👩🏻‍🎤" },
  { name: "Tariq Rahman", handle: "@tariqfit", niche: "Fitness", followers: "684K", authenticity: 91, fakePct: 6, roi: "3.6x", img: "💪🏽" },
  { name: "Lucia Park", handle: "@luciaeats", niche: "Food", followers: "412K", authenticity: 88, fakePct: 8, roi: "3.1x", img: "🍜" },
  { name: "Noah Becker", handle: "@noahgames", niche: "Gaming", followers: "2.4M", authenticity: 74, fakePct: 22, roi: "2.2x", img: "🎮" },
  { name: "Aisha Khan", handle: "@aishastyle", niche: "Fashion", followers: "920K", authenticity: 93, fakePct: 4, roi: "5.1x", img: "👗" },
  { name: "Ravi Patel", handle: "@raviedu", niche: "EdTech", followers: "318K", authenticity: 95, fakePct: 2, roi: "4.4x", img: "📚" },
];

export const mentions = [
  { user: "@trendlens", text: "Honestly @brandsync is the cleanest MarTech UI I've used in years. ✨", sentiment: "positive", time: "2m" },
  { user: "@adopslead", text: "Cut our paid spend by 38% in 6 weeks switching to BrandSync auto-pilot.", sentiment: "positive", time: "9m" },
  { user: "@growthnerd", text: "Reporting feels okay, wish exports were faster.", sentiment: "neutral", time: "21m" },
  { user: "@upsetcustomer", text: "Support never replied to my refund request. Disappointed.", sentiment: "negative", time: "33m" },
  { user: "@cmoworld", text: "BrandSync's predictive simulation literally saved a $40k campaign.", sentiment: "positive", time: "44m" },
  { user: "@anonbuyer", text: "Pricing is steep for solopreneurs.", sentiment: "negative", time: "1h" },
  { user: "@martechdaily", text: "Solid replacement for 12+ point tools. Worth a look.", sentiment: "positive", time: "1h" },
];
