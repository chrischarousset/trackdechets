import * as React from "react";
import { CellProps, CellValue } from "react-table";
import { Bsdasri } from "generated/graphql/types";

export const COLUMNS: Record<
  string,
  {
    accessor: (dasri: Bsdasri) => CellValue;
    Cell?: React.ComponentType<CellProps<Bsdasri>>;
  }
> = {
  waste: {
    accessor: dasri =>
      [dasri.emission?.wasteCode, dasri.emission?.wasteDetails?.onuCode]
        .filter(Boolean)
        .join(" "),
  },
};
