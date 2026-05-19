export const formatCurrency = (amount, currency = "NPR") =>
  new Intl.NumberFormat("ne-NP", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);

export const formatNumber = (n) =>
  new Intl.NumberFormat("ne-NP").format(n);