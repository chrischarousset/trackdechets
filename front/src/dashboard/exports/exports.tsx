import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import React, { useState } from "react";
import DownloadFileLink from "../../common/DownloadFileLink";
import { InlineError } from "../../common/Error";
import Loader from "../../common/Loader";
import { Me } from "../../login/model";

interface IProps {
  me: Me;
}

const GET_STATS = gql`
  query GetStats {
    stats {
      company {
        siret
      }
      stats {
        wasteCode
        incoming
        outgoing
      }
    }
  }
`;

const FORMS_REGISTER = gql`
  query FormsRegister($sirets: [String], $exportType: FormsRegisterExportType) {
    formsRegister(sirets: $sirets, exportType: $exportType) {
      downloadLink
    }
  }
`;

export default function Exports({ me }: IProps) {
  const [sirets, setSirets] = useState(me.companies.map(c => c.siret));
  const { loading, error, data } = useQuery(GET_STATS);

  return (
    <div className="main">
      <h2>Statistiques</h2>
      {loading && <Loader />}
      {error && <InlineError apolloError={error} />}
      {!data && <p>Aucune donnée à afficher.</p>}
      {data && (
        <table className="table">
          <thead>
            <tr>
              <th>Code déchet</th>
              <th>Quantité totale entrée</th>
              <th>Quantité totale sortie</th>
              <th>En stock / attente</th>
            </tr>
          </thead>
          <tbody>
            {data.stats[0].stats.map(s => (
              <tr key={s.wasteCode}>
                <td>{s.wasteCode}</td>
                <td>{s.incoming}</td>
                <td>{s.outgoing}</td>
                <td>
                  {Math.max(
                    0,
                    Math.round((s.incoming - s.outgoing) * 100) / 100
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2>Téléchargement de registres</h2>
      <p>
        Vous avez la possibilité de télécharger un registre des déchets entrants
        et sortants de votre entreprise. Cet export est un document CSV au
        format UTF-8. Assurez vous que vous l'ouvrez dans le bon format pour
        éviter les problèmes d'accents.
      </p>
      {me.companies.length > 1 && (
        <p>
          Pour quelle entreprise(s) souhaitez vous télécharger le registre ?{" "}
          <select onChange={evt => setSirets([evt.target.value])}>
            <option value={me.companies.map(c => c.siret)}>Toutes</option>
            {me.companies.map(c => (
              <option value={c.siret} key={c.siret}>
                {c.name}
              </option>
            ))}
          </select>
        </p>
      )}
      <DownloadFileLink
        query={FORMS_REGISTER}
        params={{ sirets, exportType: "OUTGOING" }}
        className="button"
      >
        Registre de déchets sortants
      </DownloadFileLink>
      <DownloadFileLink
        query={FORMS_REGISTER}
        params={{ sirets, exportType: "INCOMING" }}
        className="button"
      >
        Registre de déchets entrants
      </DownloadFileLink>
    </div>
  );
}
