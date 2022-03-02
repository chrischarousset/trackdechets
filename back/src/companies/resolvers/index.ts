import Query from "./Query";
import Mutation from "./Mutation";
import CompanyMember from "./CompanyMember";
import Installation from "./Installation";
import CompanyPrivate from "./CompanyPrivate";
import CompanyFavorite from "./CompanyFavorite";
import CompanySearchResult from "./CompanySearchResult";
import CompanyForVerification from "./CompanyForVerification";
import { CompanyBaseIdentifiers } from "../types";

/**
 * For nested data resolvers of Company derivatives
 * in order to find the parent Company
 */
export const whereSiretOrVatNumber = (parent: CompanyBaseIdentifiers) => {
  if (!!parent.siret) {
    return { siret: parent.siret };
  } else if (!!parent.vatNumber) {
    return { vatNumber: parent.vatNumber };
  }
};

export default {
  Query,
  Mutation,
  CompanyMember,
  Installation,
  CompanyPrivate,
  CompanyFavorite,
  CompanySearchResult,
  CompanyForVerification
};
