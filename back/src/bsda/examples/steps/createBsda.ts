import { WorkflowStep } from "../../../common/workflow";
import fixtures from "../fixtures";
import mutations from "../mutations";

export function createBsda(company: string): WorkflowStep {
  return {
    description: `Les informations du BSDA sont remplies. Cette action peut-être effectuée
    par n'importe quel établissement apparaissant sur le BSDA. À ce stade il est toujours possible
    d'effectuer des modifications grâce à la mutation updateBsda.`,
    mutation: mutations.createBsda,
    variables: ({ producteur, worker, transporteur, traiteur }) => ({
      input: {
        emitter: fixtures.emitterInput(producteur.siret),
        worker: fixtures.workerInput(worker.siret),
        destination: fixtures.destinationInput(traiteur.siret),
        transporter: fixtures.transporterInput(transporteur.siret),
        waste: fixtures.wasteInput(),
        packagings: fixtures.packagingsInput(),
        weight: fixtures.weightInput()
      }
    }),
    expected: { status: "INITIAL" },
    data: response => response.createBsda,
    company,
    setContext: (ctx, data) => ({ ...ctx, bsda: data })
  };
}

export function createPrivateIndividualBsda(company: string): WorkflowStep {
  return {
    description: `Les informations du BSDA sont remplies. L'émetteur est ici un particulier. Il n'aura pas à signer le bordereau sur Trackdéchets.
    La création du BSDA peut-être effectuée
      par n'importe quel établissement apparaissant sur le BSDA. À ce stade il est toujours possible
      d'effectuer des modifications grâce à la mutation updateBsda.`,
    mutation: mutations.createBsda,
    variables: ({ worker, transporteur, traiteur }) => ({
      input: {
        emitter: fixtures.privateIndividualEmitterInput(),
        worker: fixtures.workerInput(worker.siret),
        destination: fixtures.destinationInput(traiteur.siret),
        transporter: fixtures.transporterInput(transporteur.siret),
        waste: fixtures.wasteInput(),
        packagings: fixtures.packagingsInput(),
        weight: fixtures.weightInput()
      }
    }),
    expected: { status: "INITIAL" },
    data: response => response.createBsda,
    company,
    setContext: (ctx, data) => ({ ...ctx, bsda: data })
  };
}

export function create2710Bsda(company: string): WorkflowStep {
  return {
    description: `Les informations du BSDA sont remplies. Cette action est effectuée
    par la déchetterie. À ce stade il est toujours possible
    d'effectuer des modifications grâce à la mutation updateBsda.`,
    mutation: mutations.createBsda,
    variables: ({ producteur, traiteur }) => ({
      input: {
        type: "COLLECTION_2710",
        emitter: fixtures.emitterInput(producteur.siret),
        destination: fixtures.destinationInput(traiteur.siret),
        waste: fixtures.wasteInput(),
        packagings: fixtures.packagingsInput(),
        weight: fixtures.weightInput()
      }
    }),
    expected: { status: "INITIAL" },
    data: response => response.createBsda,
    company,
    setContext: (ctx, data) => ({ ...ctx, bsda: data })
  };
}
