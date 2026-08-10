export const planRank = (id) => (id === "year" ? 3 : id === "quarter" ? 2 : 1);

export const formatUsd = (amount) => `$${Number(amount).toFixed(2)}`;

export const subscriptionPlans = [
  {
    type: "plan",
    id: "month",
    name: "Monthly",
    monthlyPrice: 9.99,
    billedTotal: 9.99,
    originalMonthlyPrice: null,
    discountLabel: null,
    period: "/month",
    months: 1,
    billingNote: "Billed monthly · 100 Diamonds",
    upfrontDiamonds: 100,
    highlight: false,
  },
  {
    type: "plan",
    id: "quarter",
    name: "Quarterly",
    monthlyPrice: 6.67,
    billedTotal: 19.99,
    originalMonthlyPrice: 9.99,
    discountLabel: "33% OFF",
    period: "/month",
    months: 3,
    billingNote: "Billed $19.99 every 3 months · 300 Diamonds upfront",
    upfrontDiamonds: 300,
    highlight: false,
  },
  {
    type: "plan",
    id: "year",
    name: "Annual",
    monthlyPrice: 5.0,
    billedTotal: 59.99,
    originalMonthlyPrice: 9.99,
    discountLabel: "50% OFF",
    period: "/month",
    months: 12,
    billingNote: "Billed $59.99 annually · 1,200 Diamonds upfront",
    upfrontDiamonds: 1200,
    highlight: true,
  },
];

export const diamondPacks = [
  { type: "pack", id: "pack-s", name: "Small Pack", price: 9.99, diamonds: 80 },
  { type: "pack", id: "pack-m", name: "Standard Pack", price: 19.99, diamonds: 165 },
  { type: "pack", id: "pack-l", name: "Large Pack", price: 49.99, diamonds: 430 },
];

export const subscriptionRules = [
  "Get 100 Diamonds on Monthly, 300 on Quarterly, or 1,200 on Annual. Diamonds are issued upfront after each successful payment.",
  "Subscriptions renew automatically until canceled. You can turn off auto-renew in Account; access continues through the end of your paid term.",
  "A paid plan unlocks premium features. Some actions use Diamonds.",
  "Text chat is always free and does not use Diamonds.",
  "Diamonds are used for character images, chat media, short drama creation, and Discover unlocks.",
  "Diamond packs require an active subscription.",
  "You can upgrade to a higher plan; downgrades are not supported.",
];
