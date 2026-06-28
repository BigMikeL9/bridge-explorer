const wholeNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatNumber(value: number | null): string {
  return value === null ? "Unknown" : wholeNumberFormatter.format(value);
}

export function formatDecimal(value: number | null): string {
  return value === null ? "Unknown" : decimalFormatter.format(value);
}

export function formatPercent(value: number | null): string {
  return value === null ? "Unknown" : `${decimalFormatter.format(value)}%`;
}

export function formatCurrency(value: number | null): string {
  return value === null ? "Unknown" : currencyFormatter.format(value);
}

export function formatDate(value: string | null): string {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatMeters(value: number | null): string {
  return value === null ? "Unknown" : `${decimalFormatter.format(value)} m`;
}

export function formatSquareMeters(value: number | null): string {
  return value === null ? "Unknown" : `${wholeNumberFormatter.format(value)} sq m`;
}

export function formatBoolean(value: boolean | null): string {
  if (value === null) {
    return "Unknown";
  }

  return value ? "Yes" : "No";
}
