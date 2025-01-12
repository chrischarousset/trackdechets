import decoratedSearchCompany from "./searchCompany";
import decoratedSearchCompanies from "./searchCompanies";
import { UserInputError } from "apollo-server-express";
import { searchAnonymousCompany } from "./anonymous";
import { CompanySearchResult } from "./types";

export async function searchCompany(
  siret: string
): Promise<CompanySearchResult> {
  if (siret.length !== 14) {
    throw new UserInputError("Le siret doit faire 14 caractères", {
      invalidArgs: ["siret"]
    });
  }

  if (process.env.NODE_ENV === "test") {
    // do not call the APIs when running integration tests
    return Promise.resolve({} as any);
  }

  try {
    const searchResult = await decoratedSearchCompany(siret);
    return searchResult;
  } catch (err) {
    // The SIRET was not found by searching the API
    // Try searching the companies with restricted access
    const anonymousCompany = await searchAnonymousCompany(siret);
    if (anonymousCompany) {
      return anonymousCompany;
    }
    throw err;
  }
}

interface SearchCompaniesDeps {
  searchCompany: (siret: string) => Promise<CompanySearchResult>;
}

export const makeSearchCompanies =
  ({ searchCompany }: SearchCompaniesDeps) =>
  (clue: string, department?: string) => {
    if (/[0-9]{14}/.test(clue)) {
      // clue is formatted like a SIRET
      // use search by siret instead of full text
      return searchCompany(clue)
        .then(c => [c].filter(c => c.etatAdministratif === "A"))
        .catch(_ => []);
    }
    return decoratedSearchCompanies(clue, department);
  };

// use dependency injection here to easily mock `searchCompany`
// in index.test.ts
export const searchCompanies = makeSearchCompanies({ searchCompany });
