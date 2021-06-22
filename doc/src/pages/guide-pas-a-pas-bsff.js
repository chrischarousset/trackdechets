import React from "react";
import Layout from "@theme/Layout";

const BSFF_ID = `FF-20210101-AAAAAAAAA`;
const CREATE_BSFF = `
mutation CreateBsff {
  createBsff(input: {
    emitter: {
      company: {
        siret: "00000000000001",
        name: "CLIM' OP",
        address: "12 rue du Hasard, 69000 Lyon",
        contact: "DUPONT Vincent",
        mail: "contact@climop.fr",
        phone: "0600000001"
      }
    },
    waste: {
      code: "14 06 01*",
      description: "chlorofluorocarbones, HCFC, HFC",
      adr: "UN 1078- Déchets GAZ REFRGERANTS NSA, 2.2 (C/E)"
    }
  }) {
    id
  }
}
`;
const ADD_FICHE_INTERVENTION = `
mutation AddFicheIntervention {
  addFicheInterventionBsff(
    id: "${BSFF_ID}",
    numero: "001",
    input: {
      kilos: 2,
      owner: {
        company: {
          siret: "00000000000002",
          name: "SUPER MARCHE DU COIN",
          address: "4 zac du Sud, 69000 Lyon",
          contact: "AMBROISE Nicolas",
          mail: "contact@supermarcheducoin.fr",
          phone: "0600000002"
        }
      },
      postalCode: "69000"
    }
  ) {
    numero
  }
}
`;
const UPDATE_PACKAGINGS = `
mutation UpdateBsffPackagings {
  updateBsff(
    id: "${BSFF_ID}",
    input: {
      packagings: [
        {
          numero: "AAAA1",
          type: BOUTEILLE,
          litres: 5
        }
      ]
    }
  ) {
    id
  }
}
`;
const UPDATE_QUANTITY = `
mutation UpdateQuantity {
  updateBsff(
    id: "${BSFF_ID}",
    input: {
      quantity: {
        kilos: 9
      }
    }
  ) {
    id
  }
}
`;
const UPDATE_DESTINATION = `
mutation UpdateDestination {
  updateBsff(
    id: "${BSFF_ID}",
    input: {
      destination: {
        company: {
          siret: "00000000000004",
          name: "RECYCLIM",
          address: "33 impasse du Général de Gaulle, 69000 Lyon",
          contact: "PAYET Claire",
          mail: "contact@recyclim.fr",
          phone: "0600000004"
        },
        plannedOperation: {
          code: R2,
          qualification: RECUPERATION_REGENERATION
        }
      }
    }
  ) {
    id
  }
}
`;
const UPDATE_TRANSPORTER = `
mutation UpdateTransporter {
  updateBsff(
    id: "${BSFF_ID}",
    input: {
      transporter: {
        company: {
          siret: "00000000000003",
          name: "TRANSCLIM",
          address: "7 rue Allendé, 69000 Lyon",
          contact: "ROBERT Marc",
          mail: "contact@transclim.fr",
          phone: "0600000003"
        },
        transport: {
          mode: ROAD
        }
      }
    }
  ) {
    id
  }
}
`;
const EMITTER_SIGNATURE = `
mutation SignForEmitter {
  signBsff(
    id: "${BSFF_ID}",
    type: EMISSION,
    signature: {
      date: "01/01/2021",
      author: "DUPONT Vincent"
    }
  ) {
    id
  }
}
`;
const TRANSPORTER_SIGNATURE = `
mutation SignForTransporter {
  signBsff(
    id: "${BSFF_ID}",
    type: TRANSPORT,
    signature: {
      date: "01/01/2021",
      author: "ROBERT Marc"
    }
  ) {
    id
  }
}
`;

export default function GuidePasAPasBsff() {
  return (
    <Layout title="Guide pas à pas BSFF">
      <div className="GuideSectionContainer">
        <div className="GuideSectionContent">
          <h1>Guide pas à pas BSFF</h1>
          <p>
            L'objectif de ce guide est de vous présenter le fonctionnement de
            l'API pour les bordereaux de suivi de fluides frigorigènes (BSFF).
            Nous allons voir comment tracer ce type de déchet de sa collecte
            jusqu'à son traitement, avec des exemples de requêtes.
          </p>
          <p>
            Pour imager ce guide, nous allons imaginer un scénario métier dans
            lequel nous aurons les acteurs suivants :
          </p>
          <ul>
            <li>
              Un opérateur, qui fait la collecte de fluides au cours de ses
              interventions.
            </li>
            <li>
              Un transporteur, qui récupère le déchet auprès de l'opérateur et
              l'amène à l'installation de traitement.
            </li>
            <li>
              Une installation de traitement, qui va réceptionner le déchet et
              le traiter.
            </li>
          </ul>
          <p>
            Ce guide a pour objectif de présenter les moyens techniques de
            décrire un scénario métier auprès de Trackdéchets. Il est utile si
            vous souhaitez intégrer Trackdéchets à un outil existant. Il est
            tout à fait possible de tracer ses déchets sans aucune connaissance
            technique, en passant simplement par l'outil Trackdéchets.
          </p>
        </div>
        <div className="GuideSectionCode" />
      </div>
      <div className="GuideSectionContainer">
        <div className="GuideSectionContent">
          <h2>Interventions et collecte de fluides</h2>
          <p>
            Le parcours de notre déchet commence donc avec l'opérateur, que nous
            appellerons <strong>OPERATEUR Vincent</strong> et dont l'entreprise
            s'appelle <strong>CLIM' OP</strong>.
          </p>
        </div>
        <div className="GuideSectionCode" />
      </div>
      <div className="GuideSectionContainer">
        <div className="GuideSectionContent">
          <p>
            L'opérateur, sachant qu'il va effectuer des interventions
            nécessitant la récupération de fluides, va créer un nouveau
            bordereau.
          </p>
          <p>
            Dans cette mutation qui crée le bordereau, nous requêtons l'
            <code>id</code> qui sera à faire figurer sur les fiches
            d'interventions. Il s'agit de l'identifiant unique du bordereau,
            pour ce guide partons du principe que notre identifiant est{" "}
            <strong>{BSFF_ID}</strong>.
          </p>
        </div>
        <div className="GuideSectionCode">
          <pre dangerouslySetInnerHTML={{ __html: CREATE_BSFF.trim() }} />
        </div>
      </div>
      <div className="GuideSectionContainer">
        <div className="GuideSectionContent">
          <p>
            Imaginons maintenant que l'opérateur effectue des interventions et
            récupère des fluides à faire traiter. Il va pouvoir compléter le
            bordereau en transmettant : le numéro de la fiche d'intervention, le
            poids du déchet récupéré, le détenteur de l'équipement et le code
            postal du lieu de collecte.
          </p>
          <p>
            L'opérateur peut comme ça répéter l'opération autant de fois qu'il y
            a d'interventions.
          </p>
        </div>
        <div className="GuideSectionCode">
          <pre
            dangerouslySetInnerHTML={{ __html: ADD_FICHE_INTERVENTION.trim() }}
          />
        </div>
      </div>
      <div className="GuideSectionContainer">
        <div className="GuideSectionContent">
          <p>
            Lors de ses interventions, les fluides collectés par l'opérateur
            sont stockés dans des bouteilles. Ces contenants, qui ne figuraient
            pas sur le bordereau au moment de sa création, peuvent être ajoutés
            via une mise à jour du bordereau.
          </p>
        </div>
        <div className="GuideSectionCode">
          <pre dangerouslySetInnerHTML={{ __html: UPDATE_PACKAGINGS.trim() }} />
        </div>
      </div>
      <div className="GuideSectionContainer">
        <div className="GuideSectionContent">
          <p>
            L'opérateur souhaite maintenant boucler ce bordereau afin de
            transmettre le déchet. Il va donc indiquer le poids total du déchet.
          </p>
        </div>
        <div className="GuideSectionCode">
          <pre dangerouslySetInnerHTML={{ __html: UPDATE_QUANTITY.trim() }} />
        </div>
      </div>
      <div className="GuideSectionContainer">
        <div className="GuideSectionContent">
          <p>
            L'opérateur étant prêt à transmettre le déchet pour traitement. Pour
            ça, imaginons qu'il fasse confiance à <strong>PAYET Claire</strong>,
            responsable du centre de traitement <strong>RECYCLIM</strong>. Il
            ajoute donc leurs informations au bordereau. Il en profite pour
            déclarer l'opération de traitement sur laquelle ils se sont mis
            d'accord.
          </p>
        </div>
        <div className="GuideSectionCode">
          <pre
            dangerouslySetInnerHTML={{ __html: UPDATE_DESTINATION.trim() }}
          />
        </div>
      </div>
      <div className="GuideSectionContainer">
        <div className="GuideSectionContent">
          <h2>Transport du déchet</h2>
        </div>
        <div className="GuideSectionCode" />
      </div>
      <div className="GuideSectionContainer">
        <div className="GuideSectionContent">
          <p>
            Maintenant que le centre de traitement figure sur le bordereau, il
            est en mesure de le compléter. Il peut donc ajouter les informations
            de <strong>ROBERT Marc</strong>, transporteur pour{" "}
            <strong>TRANSCLIM</strong>.
          </p>
        </div>
        <div className="GuideSectionCode">
          <pre
            dangerouslySetInnerHTML={{ __html: UPDATE_TRANSPORTER.trim() }}
          />
        </div>
      </div>
      <div className="GuideSectionContainer">
        <div className="GuideSectionContent">
          <p>
            À ce stade le bordereau contient les informations essentielles.
            C'est habituellement le moment où le transporteur se rend chez
            l'opérateur afin de récupérer le déchet. Lors de cet échange,
            l'opérateur signe le document en premier.
          </p>
        </div>
        <div className="GuideSectionCode">
          <pre dangerouslySetInnerHTML={{ __html: EMITTER_SIGNATURE.trim() }} />
        </div>
      </div>
      <div className="GuideSectionContainer">
        <div className="GuideSectionContent">
          <p>Puis vient au tour du transporteur de signer.</p>
        </div>
        <div className="GuideSectionCode">
          <pre
            dangerouslySetInnerHTML={{ __html: TRANSPORTER_SIGNATURE.trim() }}
          />
        </div>
      </div>
    </Layout>
  );
}
