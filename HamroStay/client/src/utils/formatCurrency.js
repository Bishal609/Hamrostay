export const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);

export const formatNumber = (n) =>
  new Intl.NumberFormat("en-US").format(n);