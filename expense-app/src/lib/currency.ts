export interface Country {
  name: {
    common: string;
  };
  currencies: {
    [code: string]: {
      name: string;
      symbol: string;
    };
  };
}

export interface ExchangeRates {
  base: string;
  rates: {
    [currency: string]: number;
  };
}

let countriesCache: Country[] | null = null;
const exchangeRatesCache: { [base: string]: ExchangeRates } = {};

export async function fetchCountries(): Promise<Country[]> {
  if (countriesCache) return countriesCache;

  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,currencies"
    );
    const data = await response.json();
    countriesCache = data;
    return data;
  } catch (error) {
    console.error("[v0] Error fetching countries:", error);
    return [];
  }
}

export async function fetchExchangeRates(
  baseCurrency: string
): Promise<Record<string, number>> {
  try {
    // Using a free exchange rate API
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error("[v0] Failed to fetch exchange rates:", error);
    // Fallback to mock rates
    return {
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      AUD: 1.35,
      CAD: 1.25,
      CHF: 0.92,
      CNY: 6.45,
      INR: 74.5,
    };
  }
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  if (from === to) return amount;

  try {
    const rates = await fetchExchangeRates(from);
    const rate = rates[to];
    if (!rate) {
      console.error(`[v0] Exchange rate not found for ${from} to ${to}`);
      return amount;
    }
    return amount * rate;
  } catch (error) {
    console.error("[v0] Currency conversion failed:", error);
    return amount;
  }
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    CNY: "¥",
    INR: "₹",
  };
  return symbols[currency] || currency;
}

export async function getExchangeRateDisplay(
  from: string,
  to: string
): Promise<string> {
  if (from === to) return "1:1";

  try {
    const rates = await fetchExchangeRates(from);
    const rate = rates[to];
    if (!rate) return "N/A";
    return `1 ${from} = ${rate.toFixed(4)} ${to}`;
  } catch (error) {
    return "N/A";
  }
}
