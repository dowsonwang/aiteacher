export const planRank = (id) => (id === "year" ? 3 : id === "quarter" ? 2 : 1);

export const formatUsd = (amount) => `$${Number(amount).toFixed(2)}`;

export const subscriptionPlans = [
  {
    type: "plan",
    id: "month",
    name: "Monthly",
    original: 9.99,
    discounted: 9.99,
    discountLabel: null,
    period: "/month",
    months: 1,
    monthlyCredits: 100,
    totalCredits: 100,
    highlight: false,
  },
  {
    type: "plan",
    id: "quarter",
    name: "Quarterly",
    original: 29.97,
    discounted: 26.99,
    discountLabel: "10% OFF",
    period: "/quarter",
    months: 3,
    monthlyCredits: 100,
    totalCredits: 300,
    highlight: false,
  },
  {
    type: "plan",
    id: "year",
    name: "Yearly",
    original: 119.88,
    discounted: 95.99,
    discountLabel: "20% OFF",
    period: "/year",
    months: 12,
    monthlyCredits: 100,
    totalCredits: 1200,
    highlight: true,
  },
];

export const diamondPacks = [
  { type: "pack", id: "pack-s", name: "Small Pack", price: 9.99, diamonds: 80 },
  { type: "pack", id: "pack-m", name: "Standard Pack", price: 19.99, diamonds: 165 },
  { type: "pack", id: "pack-l", name: "Large Pack", price: 49.99, diamonds: 430 },
  { type: "pack", id: "pack-xl", name: "Ultra Pack", price: 99.99, diamonds: 900 },
];

export const subscriptionRules = [
  "Credits are issued monthly according to the selected plan.",
  "Quarterly and yearly credits are issued monthly, not all at once.",
  "Text chat is always free and does not use diamonds.",
  "Diamonds are used for character images, chat media, short drama creation, and Discover unlocks.",
  "You can upgrade to a higher plan; downgrades are not supported.",
];
