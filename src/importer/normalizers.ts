import type { BridgeCondition } from "@/domain/bridge";

export type CoordinateKind = "latitude" | "longitude";

export function normalizeText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return null;
  }

  const withoutQuotes = trimmed.replace(/^'+|'+$/g, "").trim();
  return withoutQuotes || null;
}

export function normalizeNumber(value: unknown): number | null {
  const text = normalizeText(value);
  if (!text || text.toUpperCase() === "N") {
    return null;
  }

  const parsed = Number(text.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeInteger(value: unknown): number | null {
  const number = normalizeNumber(value);
  return number === null ? null : Math.trunc(number);
}

export function normalizeCoordinate(
  value: unknown,
  kind: CoordinateKind
): number | null {
  const text = normalizeText(value);
  if (!text || text.toUpperCase() === "N") {
    return null;
  }

  const sign = text.startsWith("-") ? -1 : 1;
  const compact = text.replace(/[^\d.]/g, "");
  if (!compact) {
    return null;
  }

  const degreeDigits = kind === "latitude" ? 2 : 3;
  const parts = compact.split(".");
  const whole = parts[0] ?? "";

  if (whole.length < degreeDigits + 4) {
    return null;
  }

  const degrees = Number(whole.slice(0, degreeDigits));
  const minutes = Number(whole.slice(degreeDigits, degreeDigits + 2));
  const secondDigits = whole.slice(degreeDigits + 2);
  const seconds =
    parts.length > 1
      ? Number(`${secondDigits}.${parts.slice(1).join("")}`)
      : secondDigits.length > 2
        ? Number(secondDigits) / 100
        : Number(secondDigits);

  if (
    !Number.isFinite(degrees) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(seconds) ||
    minutes >= 60 ||
    seconds >= 60
  ) {
    return null;
  }

  const decimal = degrees + minutes / 60 + seconds / 3600;
  const signedDecimal = kind === "longitude" && sign > 0 ? -decimal : sign * decimal;
  const max = kind === "latitude" ? 90 : 180;

  return Math.abs(signedDecimal) <= max ? signedDecimal : null;
}

export function hasValidCoordinates(
  latitude: number | null,
  longitude: number | null
): boolean {
  return (
    latitude !== null &&
    longitude !== null &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function normalizeInspectionDate(value: unknown): Date | null {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  const digits = text.replace(/\D/g, "").padStart(4, "0");
  if (digits.length !== 4) {
    return null;
  }

  const month = Number(digits.slice(0, 2));
  const year = Number(digits.slice(2, 4));

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  const fullYear = year >= 70 ? 1900 + year : 2000 + year;
  return new Date(Date.UTC(fullYear, month - 1, 1));
}

export function normalizeBridgeCondition(value: unknown): BridgeCondition {
  switch (normalizeText(value)?.toUpperCase()) {
    case "G":
      return "Good";
    case "F":
      return "Fair";
    case "P":
      return "Poor";
    default:
      return "Unknown";
  }
}

export function normalizeRiskFlag(value: unknown): boolean {
  const text = normalizeText(value)?.toUpperCase();
  return Boolean(text && text !== "N" && text !== "0");
}
