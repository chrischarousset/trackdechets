import { gql } from "@apollo/client";
import {
  detailFormFragment,
  fullFormFragment,
  dasriFragment,
  vhuFragment,
} from "./fragments";

// full fledged bsd to display in detailled views
export const GET_DETAIL_FORM = gql`
  query Form($id: ID) {
    form(id: $id) {
      ...DetailFormFragment
    }
  }
  ${detailFormFragment}
`;

export const GET_DETAIL_DASRI = gql`
  query Bsdasri($id: ID!) {
    bsdasri(id: $id) {
      ...DasriFragment
    }
  }
  ${dasriFragment}
`;

export const GET_BSDS = gql`
  query GetBsds(
    $after: String
    $first: Int
    $clue: String
    $where: BsdWhere
    $orderBy: OrderBy
  ) {
    bsds(
      after: $after
      first: $first
      clue: $clue
      where: $where
      orderBy: $orderBy
    ) {
      edges {
        node {
          ... on Form {
            ...FullForm
          }
          ... on Bsdasri {
            ...DasriFragment
          }
          ... on Bsvhu {
            ...VhuFragment
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
      totalCount
    }
  }
  ${fullFormFragment}
  ${dasriFragment}
  ${vhuFragment}
`;
