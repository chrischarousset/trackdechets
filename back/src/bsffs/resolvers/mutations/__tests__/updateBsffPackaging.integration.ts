import { WasteAcceptationStatus } from "@prisma/client";
import { gql } from "apollo-server-core";
import {
  Mutation,
  MutationUpdateBsffPackagingArgs
} from "../../../../generated/graphql/types";
import { userWithCompanyFactory } from "../../../../__tests__/factories";
import makeClient from "../../../../__tests__/testClient";
import {
  createBsffAfterOperation,
  createBsffAfterReception,
  createBsffBeforeOperation
} from "../../../__tests__/factories";
import prisma from "../../../../prisma";
import { resetDatabase } from "../../../../../integration-tests/helper";
import * as sirenify from "../../../sirenify";

const sirenifyMock = jest
  .spyOn(sirenify, "sirenifyBsffPackagingInput")
  .mockImplementation(input => Promise.resolve(input));

const UPDATE_BSFF_PACKAGING = gql`
  mutation UpdateBsffPackaging($id: ID!, $input: UpdateBsffPackagingInput!) {
    updateBsffPackaging(id: $id, input: $input) {
      id
    }
  }
`;

describe("Mutation.updateBsffPackaging", () => {
  afterEach(async () => {
    await resetDatabase();
    sirenifyMock.mockClear();
  });

  test("before acceptation > it should be possible to update acceptation fields", async () => {
    const emitter = await userWithCompanyFactory("MEMBER");
    const transporter = await userWithCompanyFactory("MEMBER");
    const destination = await userWithCompanyFactory("MEMBER");
    const bsff = await createBsffAfterReception({
      emitter,
      transporter,
      destination
    });

    const packagingId = bsff.packagings[0].id;

    const { mutate } = makeClient(destination.user);
    await mutate<
      Pick<Mutation, "updateBsffPackaging">,
      MutationUpdateBsffPackagingArgs
    >(UPDATE_BSFF_PACKAGING, {
      variables: {
        id: packagingId,
        input: {
          acceptation: {
            date: new Date().toISOString() as any,
            status: WasteAcceptationStatus.ACCEPTED,
            weight: 1
          }
        }
      }
    });

    const updatedPackaging = await prisma.bsffPackaging.findUnique({
      where: { id: packagingId }
    });
    expect(updatedPackaging.acceptationStatus).toEqual(
      WasteAcceptationStatus.ACCEPTED
    );
    // check input is sirenified
    expect(sirenifyMock).toHaveBeenCalledTimes(1);
  });

  it("should throw error if the mutation is not called by the destination", async () => {
    const emitter = await userWithCompanyFactory("MEMBER");
    const transporter = await userWithCompanyFactory("MEMBER");
    const destination = await userWithCompanyFactory("MEMBER");
    const bsff = await createBsffAfterReception({
      emitter,
      transporter,
      destination
    });

    const packagingId = bsff.packagings[0].id;

    const { mutate } = makeClient(emitter.user);
    const { errors } = await mutate<
      Pick<Mutation, "updateBsffPackaging">,
      MutationUpdateBsffPackagingArgs
    >(UPDATE_BSFF_PACKAGING, {
      variables: {
        id: packagingId,
        input: {
          acceptation: {
            date: new Date().toISOString() as any,
            status: WasteAcceptationStatus.ACCEPTED,
            weight: 1
          }
        }
      }
    });
    expect(errors).toEqual([
      expect.objectContaining({
        message:
          "Seul le destinataire du BSFF peut modifier les informations d'acceptation et d'opération sur un contenant"
      })
    ]);
  });

  test("before acceptation > it should be possible to update acceptation fields", async () => {
    const emitter = await userWithCompanyFactory("MEMBER");
    const transporter = await userWithCompanyFactory("MEMBER");
    const destination = await userWithCompanyFactory("MEMBER");
    const bsff = await createBsffAfterReception({
      emitter,
      transporter,
      destination
    });

    const packagingId = bsff.packagings[0].id;

    const { mutate } = makeClient(destination.user);
    await mutate<
      Pick<Mutation, "updateBsffPackaging">,
      MutationUpdateBsffPackagingArgs
    >(UPDATE_BSFF_PACKAGING, {
      variables: {
        id: packagingId,
        input: {
          acceptation: {
            date: "2022-11-04" as any,
            weight: 1,
            status: "ACCEPTED",
            wasteCode: "14 06 01*",
            wasteDescription: "R404A"
          }
        }
      }
    });

    const updatedPackaging = await prisma.bsffPackaging.findUnique({
      where: { id: packagingId }
    });
    expect(updatedPackaging.acceptationStatus).toEqual(
      WasteAcceptationStatus.ACCEPTED
    );
  });

  test("before acceptation > it should be possible to update numero", async () => {
    const emitter = await userWithCompanyFactory("MEMBER");
    const transporter = await userWithCompanyFactory("MEMBER");
    const destination = await userWithCompanyFactory("MEMBER");
    const bsff = await createBsffAfterReception({
      emitter,
      transporter,
      destination
    });

    const packagingId = bsff.packagings[0].id;

    const { mutate } = makeClient(destination.user);
    await mutate<
      Pick<Mutation, "updateBsffPackaging">,
      MutationUpdateBsffPackagingArgs
    >(UPDATE_BSFF_PACKAGING, {
      variables: {
        id: packagingId,
        input: {
          numero: "nouveau-numero"
        }
      }
    });

    const updatedPackaging = await prisma.bsffPackaging.findUnique({
      where: { id: packagingId }
    });
    expect(updatedPackaging.numero).toEqual("nouveau-numero");
    expect(updatedPackaging.emissionNumero).toEqual(bsff.packagings[0].numero);
  });

  test("before acceptation > it should throw error when trying to set an empty or null numero", async () => {
    const emitter = await userWithCompanyFactory("MEMBER");
    const transporter = await userWithCompanyFactory("MEMBER");
    const destination = await userWithCompanyFactory("MEMBER");
    const bsff = await createBsffAfterReception({
      emitter,
      transporter,
      destination
    });

    const packagingId = bsff.packagings[0].id;

    const { mutate } = makeClient(destination.user);
    const { errors: errors1 } = await mutate<
      Pick<Mutation, "updateBsffPackaging">,
      MutationUpdateBsffPackagingArgs
    >(UPDATE_BSFF_PACKAGING, {
      variables: {
        id: packagingId,
        input: {
          numero: ""
        }
      }
    });

    expect(errors1).toEqual([
      expect.objectContaining({
        message: "Le numéro de contenant ne peut pas être nul ou vide"
      })
    ]);

    const { errors: errors2 } = await mutate<
      Pick<Mutation, "updateBsffPackaging">,
      MutationUpdateBsffPackagingArgs
    >(UPDATE_BSFF_PACKAGING, {
      variables: {
        id: packagingId,
        input: {
          numero: null
        }
      }
    });

    expect(errors2).toEqual([
      expect.objectContaining({
        message: "Le numéro de contenant ne peut pas être nul ou vide"
      })
    ]);
  });

  test("after acceptation > it should not be possible to update sealed fields", async () => {
    const emitter = await userWithCompanyFactory("MEMBER");
    const transporter = await userWithCompanyFactory("MEMBER");
    const destination = await userWithCompanyFactory("MEMBER");
    const bsff = await createBsffBeforeOperation({
      emitter,
      transporter,
      destination
    });

    const packagingId = bsff.packagings[0].id;

    const { mutate } = makeClient(destination.user);
    const { errors } = await mutate<
      Pick<Mutation, "updateBsffPackaging">,
      MutationUpdateBsffPackagingArgs
    >(UPDATE_BSFF_PACKAGING, {
      variables: {
        id: packagingId,
        input: {
          numero: "nouveau-numero",
          acceptation: {
            date: "2022-11-04" as any,
            weight: 2,
            status: "ACCEPTED",
            wasteCode: "14 06 02*",
            wasteDescription: "HFC"
          }
        }
      }
    });
    expect(errors).toEqual([
      expect.objectContaining({
        message:
          "Des champs ont été verrouillés via signature et ne peuvent plus être modifiés" +
          " : numero, acceptationDate, acceptationWeight, acceptationWasteCode, acceptationWasteDescription"
      })
    ]);
  });

  test("before operation > it should be possible to update operation fields", async () => {
    const emitter = await userWithCompanyFactory("MEMBER");
    const transporter = await userWithCompanyFactory("MEMBER");
    const destination = await userWithCompanyFactory("MEMBER");
    const nextDestination = await userWithCompanyFactory("MEMBER");
    const bsff = await createBsffBeforeOperation({
      emitter,
      transporter,
      destination
    });

    const packagingId = bsff.packagings[0].id;

    const { mutate } = makeClient(destination.user);
    await mutate<
      Pick<Mutation, "updateBsffPackaging">,
      MutationUpdateBsffPackagingArgs
    >(UPDATE_BSFF_PACKAGING, {
      variables: {
        id: packagingId,
        input: {
          operation: {
            date: "2022-11-05" as any,
            code: "D13",
            description: "Regroupement",
            nextDestination: {
              plannedOperationCode: "R2",
              cap: "CAP 2",
              company: {
                siret: nextDestination.company.siret,
                name: "Traiteur & Co",
                address: "1 avenue des roses 67100 Strasbourg",
                contact: "Thomas Largeron",
                phone: "03 00 00 00 00",
                mail: "thomas.largeron@traiteur.fr"
              }
            }
          }
        }
      }
    });

    const updatedPackaging = await prisma.bsffPackaging.findUnique({
      where: { id: packagingId }
    });
    expect(updatedPackaging.operationCode).toEqual("D13");
  });

  test("after operation > it should not be possible to update sealed fields", async () => {
    const emitter = await userWithCompanyFactory("MEMBER");
    const transporter = await userWithCompanyFactory("MEMBER");
    const destination = await userWithCompanyFactory("MEMBER");
    const nextDestination = await userWithCompanyFactory("MEMBER");
    const bsff = await createBsffAfterOperation({
      emitter,
      transporter,
      destination
    });

    const packagingId = bsff.packagings[0].id;

    const { mutate } = makeClient(destination.user);
    const { errors } = await mutate<
      Pick<Mutation, "updateBsffPackaging">,
      MutationUpdateBsffPackagingArgs
    >(UPDATE_BSFF_PACKAGING, {
      variables: {
        id: packagingId,
        input: {
          operation: {
            date: "2022-11-05" as any,
            code: "D13",
            description: "Regroupement",
            nextDestination: {
              plannedOperationCode: "R2",
              cap: "CAP 2",
              company: {
                siret: nextDestination.company.siret,
                name: "Traiteur & Co",
                address: "1 avenue des roses 67100 Strasbourg",
                contact: "Thomas Largeron",
                phone: "03 00 00 00 00",
                mail: "thomas.largeron@traiteur.fr"
              }
            }
          }
        }
      }
    });
    expect(errors).toEqual([
      expect.objectContaining({
        message:
          "Des champs ont été verrouillés via signature et ne peuvent plus être modifiés :" +
          " operationDate, operationCode, operationDescription, operationNextDestinationPlannedOperationCode," +
          " operationNextDestinationCap, operationNextDestinationCompanyName, operationNextDestinationCompanySiret," +
          " operationNextDestinationCompanyAddress, operationNextDestinationCompanyContact," +
          " operationNextDestinationCompanyPhone, operationNextDestinationCompanyMail"
      })
    ]);
  });
});
