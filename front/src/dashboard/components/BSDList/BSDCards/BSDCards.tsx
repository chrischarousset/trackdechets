import * as React from "react";
import { Link, generatePath, useLocation, useParams } from "react-router-dom";
import { CellProps } from "react-table";
import { Bsd } from "generated/graphql/types";
import routes from "common/routes";
import { IconView } from "common/components/Icons";
import { WorkflowAction } from "../BSDD/WorkflowAction";
import { Column } from "../columns";
import styles from "./BSDCards.module.scss";
import { BsdTypename } from "dashboard/constants";
interface BSDCardsProps {
  bsds: Bsd[];
  columns: Column[];
}

export function BSDCards({ bsds, columns }: BSDCardsProps) {
  const location = useLocation();
  const { siret } = useParams<{ siret: string }>();

  return (
    <div className={styles.BSDCards}>
      {bsds.map(form => (
        <div key={form.id} className={styles.BSDCard}>
          <ul className={styles.BSDCardList}>
            {columns.map(column => {
              const Cell = column.Cell as React.ComponentType<CellProps<Bsd>>;

              return (
                <li key={column.id} className={styles.BSDCardListItem}>
                  <div className={styles.BSDCardListItemLabel}>
                    {column.Header}
                  </div>
                  <div className={styles.BSDCardListItemValue}>
                    <Cell
                      value={column.accessor!(form, 0, {
                        data: bsds,
                        depth: 0,
                        subRows: [],
                      })}
                      // @ts-ignore
                      row={{ original: form }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className={styles.BSDCardActions}>
            {!!form.__typename && (
              <Link
                to={{
                  pathname: generatePath(getViewRoute(form.__typename), {
                    siret,
                    id: form.id,
                  }),
                  state: { background: location },
                }}
                className="btn btn--outline-primary"
              >
                <IconView size="24px" style={{ marginRight: "1rem" }} />
                Aperçu
              </Link>
            )}
            {form.__typename === "Form" ? (
              <WorkflowAction siret={siret} form={form} />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

const getViewRoute = (bsdTypename: BsdTypename): string =>
  ({
    Form: routes.dashboard.bsdds.view,
    Bsdasri: routes.dashboard.bsdasris.view,
  }[bsdTypename]);
