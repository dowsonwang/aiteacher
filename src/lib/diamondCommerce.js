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
    billingNote: "Billed $19.99 every 3 months · 100 Diamonds/month",
    upfrontDiamonds: 100,
    monthlyDiamonds: 100,
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
    billingNote: "Billed $59.99 annually · 100 Diamonds/month",
    upfrontDiamonds: 100,
    monthlyDiamonds: 100,
    highlight: true,
  },
];

export const diamondPacks = [
  { type: "pack", id: "pack-s", name: "Small Pack", price: 9.99, diamonds: 80 },
  { type: "pack", id: "pack-m", name: "Standard Pack", price: 19.99, diamonds: 200 },
  { type: "pack", id: "pack-l", name: "Large Pack", price: 49.99, diamonds: 800 },
];

export const subscriptionRules = [
  "All paid plans include 100 Diamonds per month. 100 Diamonds are issued immediately after each successful payment, and 100 Diamonds are issued at the start of each subsequent billing month.",
  "Subscriptions renew automatically until canceled. You can turn off auto-renew in Account; access continues through the end of your paid term.",
  "A paid plan unlocks premium features. Some actions use Diamonds.",
  "Diamonds are used for character images, chat media, short drama creation, and Discover unlocks.",
  "Diamond packs require an active subscription.",
  "You can upgrade to a higher plan; downgrades are not supported.",
];
