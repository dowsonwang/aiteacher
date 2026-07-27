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
    monthlyCredits: 8500,
    totalCredits: 8500,
    highlight: false,
  },
  {
    type: "plan",
    id: "quarter",
    name: "Quarterly",
    original: 29.99,
    discounted: 26.99,
    discountLabel: "10% OFF",
    period: "/quarter",
    months: 3,
    monthlyCredits: 8500,
    totalCredits: 25500,
    highlight: false,
  },
  {
    type: "plan",
    id: "year",
    name: "Yearly",
    original: 119.99,
    discounted: 95.99,
    discountLabel: "20% OFF",
    period: "/year",
    months: 12,
    monthlyCredits: 8500,
    totalCredits: 102000,
    highlight: true,
  },
];

export const diamondPacks = [
  { type: "pack", id: "pack-s", name: "Small Pack", price: 6.99, diamonds: 5450 },
  { type: "pack", id: "pack-m", name: "Standard Pack", price: 16.99, diamonds: 13350 },
  { type: "pack", id: "pack-l", name: "Large Pack", price: 36.99, diamonds: 29000 },
  { type: "pack", id: "pack-xl", name: "Ultra Pack", price: 69.99, diamonds: 54900 },
];

export const subscriptionRules = [
  "Credits are issued monthly according to the selected plan.",
  "Quarterly and yearly credits are issued monthly, not all at once.",
  "Monthly subscription credits expire at the end of each billing month.",
  "You can upgrade to a higher plan; downgrades are not supported.",
];
