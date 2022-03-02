import { checkVAT, countries } from "jsvat";

export enum CountryCodes {
  Austria = "AT",
  Belgium = "BE",
  Bulgaria = "BG",
  Croatia = "HR",
  Cyprus = "CY",
  CzechRepublic = "CZ",
  Denmark = "DK",
  Estonia = "EE",
  Finland = "FI",
  France = "FR",
  Germany = "DE",
  Greece = "EL",
  Hungary = "HU",
  Ireland = "IE",
  Italy = "IT",
  Latvia = "LV",
  Lithuania = "LT",
  Luxembourg = "LU",
  Malta = "MT",
  Netherlands = "NL",
  Poland = "PL",
  Portugal = "PT",
  Romania = "RO",
  Slovakia = "SK",
  Slovenia = "SI",
  Spain = "ES",
  Sweden = "SE",
  NorthernIreland = "XI"
}

/**
 * SIRET number validator
 */
export const isSiret = (clue: string): boolean =>
  !!clue && !!/^[0-9]{14}$/.test(clue.replace(/\s/g, ""));

/**
 * VAT validator
 * both rules are required, checkVat allows digit-only VAT numbers, may be confusing with SIRET
 */
export const isVat = (clue: string): boolean => {
  if (!clue) return false;
  const countryCode = clue.replace(/\s/g, "").slice(0, 2).toUpperCase();
  const countrycodeValid = (Object.values(CountryCodes) as string[]).includes(
    countryCode
  );
  const isRegextValid = checkVAT(clue.trim(), countries);
  return countrycodeValid && isRegextValid.isValid;
};

/**
 * French VAT
 */
export const isFRVat = (clue: string): boolean => {
  if (!clue) return false;
  return clue.replace(/\s/g, "").slice(0, 2).toUpperCase().startsWith("FR");
};
