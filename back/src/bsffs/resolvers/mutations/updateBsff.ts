import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Prisma, BsffType, Bsff } from "@prisma/client";
import {
  BsffSignatureType,
  MutationResolvers
} from "../../../generated/graphql/types";
import { checkIsAuthenticated } from "../../../common/permissions";
import { getBsffOrNotFound, getPackagingCreateInput } from "../../database";
import { flattenBsffInput, expandBsffFromDB } from "../../converter";
import { checkCanWriteBsff } from "../../permissions";
import {
  validateBsff,
  validateFicheInterventions,
  validatePreviousPackagings
} from "../../validation";
import { toBsffPackagingWithType } from "../../compat";
import {
  getBsffFicheInterventionRepository,
  getBsffPackagingRepository,
  getBsffRepository
} from "../../repository";

const updateBsff: MutationResolvers["updateBsff"] = async (
  _,
  { id, input },
  context
) => {
  const user = checkIsAuthenticated(context);

  const existingBsff = await getBsffOrNotFound({ id });
  await checkCanWriteBsff(user, existingBsff);

  const { findPreviousPackagings } = getBsffPackagingRepository(user);
  const { findMany: findManyFicheInterventions } =
    getBsffFicheInterventionRepository(user);
  const { update: updateBsff } = getBsffRepository(user);

  if (input.type && input.type !== existingBsff.type) {
    throw new UserInputError(
      "Vous ne pouvez pas modifier le type de BSFF après création"
    );
  }

  if (
    input.emitter?.company?.siret?.length &&
    [
      BsffType.GROUPEMENT,
      BsffType.RECONDITIONNEMENT,
      BsffType.REEXPEDITION
    ].includes(existingBsff.type as any) &&
    input.emitter?.company?.siret !== existingBsff.emitterCompanySiret
  ) {
    throw new UserInputError(
      "Vous ne pouvez pas modifier l'établissement émetteur après création du BSFF en cas de réexpédition, groupement ou reconditionnement"
    );
  }

  if (existingBsff.emitterEmissionSignatureDate) {
    // discard related objects updates after emission signatures
    delete input.packagings;
    delete input.grouping;
    delete input.forwarding;
    delete input.repackaging;
    delete input.ficheInterventions;
  }
  const flatInput = flattenBsffInput(input);

  const futureBsff = {
    ...existingBsff,
    ...flatInput,
    packagings:
      input.packagings?.map(toBsffPackagingWithType) ?? existingBsff.packagings
  };

  await checkCanWriteBsff(user, futureBsff);

  await checkSealedFields(flatInput, existingBsff);

  const packagingHasChanged =
    !!input.forwarding ||
    !!input.grouping ||
    !!input.repackaging ||
    !!input.packagings;

  await validateBsff(futureBsff);

  const existingPreviousPackagings = await findPreviousPackagings(
    existingBsff.packagings.map(p => p.id),
    1
  );

  const ficheInterventions = await findManyFicheInterventions({
    where:
      input.ficheInterventions?.length > 0
        ? { id: { in: input.ficheInterventions } }
        : { bsffs: { some: { id: { in: [existingBsff.id] } } } }
  });

  await validateFicheInterventions(futureBsff, ficheInterventions);

  const futurePreviousPackagingsIds = {
    ...(futureBsff.type === BsffType.REEXPEDITION
      ? {
          forwarding:
            input.forwarding ?? existingPreviousPackagings.map(p => p.id)
        }
      : {}),
    ...(futureBsff.type === BsffType.GROUPEMENT
      ? {
          grouping: input.grouping ?? existingPreviousPackagings.map(p => p.id)
        }
      : {}),
    ...(futureBsff.type === BsffType.RECONDITIONNEMENT
      ? {
          repackaging:
            input.repackaging ?? existingPreviousPackagings.map(p => p.id)
        }
      : {})
  };

  const futurePreviousPackagings = await validatePreviousPackagings(
    futureBsff,
    futurePreviousPackagingsIds
  );

  const data: Prisma.BsffUpdateInput = {
    ...flatInput,
    ...(packagingHasChanged
      ? {
          packagings: {
            deleteMany: {},
            create: getPackagingCreateInput(
              futureBsff,
              futurePreviousPackagings
            )
          }
        }
      : {})
  };

  if (ficheInterventions.length > 0) {
    data.ficheInterventions = {
      set: ficheInterventions.map(({ id }) => ({ id }))
    };
    data.detenteurCompanySirets = ficheInterventions
      .map(fi => fi.detenteurCompanySiret)
      .filter(Boolean);
  }

  const updatedBsff = await updateBsff({ where: { id }, data });

  return expandBsffFromDB(updatedBsff);
};

export default updateBsff;

// Fields that can be updated via `updateBsff`
type EditableFields = keyof Omit<
  Prisma.BsffUpdateInput,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "isDeleted"
  | "isDraft"
  | "status"
  | "detenteurCompanySirets"
  | "emitterEmissionSignatureAuthor"
  | "emitterEmissionSignatureDate"
  | "transporterTransportSignatureAuthor"
  | "transporterTransportSignatureDate"
  | "destinationOperationSignatureAuthor"
  | "destinationOperationSignatureDate"
  | "destinationReceptionSignatureAuthor"
  | "destinationReceptionSignatureDate"
  | "grouping"
  | "groupedIn"
  | "repackaging"
  | "repackagedIn"
  | "forwarding"
  | "forwardedIn"
  | "ficheInterventions"
  | "packagings"
  // the below fields has been migrated to BsffPackaging and
  // will be deleted in prisma schema
  | "destinationReceptionWeight"
  | "destinationOperationCode"
  | "destinationReceptionAcceptationStatus"
  | "destinationReceptionRefusalReason"
  | "destinationOperationNextDestinationCompanyName"
  | "destinationOperationNextDestinationCompanySiret"
  | "destinationOperationNextDestinationCompanyVatNumber"
  | "destinationOperationNextDestinationCompanyAddress"
  | "destinationOperationNextDestinationCompanyContact"
  | "destinationOperationNextDestinationCompanyPhone"
  | "destinationOperationNextDestinationCompanyMail"
>;

/**
 * Defines until which signature editable fields can be modified
 * The typing Record<EditableFields, BsffSignatureType> ensure that
 * the typing will break anytime we add a field to the Bsff model so that
 * we think of adding a new edition rule
 */
const editionRules: Record<EditableFields, BsffSignatureType> = {
  type: "EMISSION",
  emitterCompanyName: "EMISSION",
  emitterCompanySiret: "EMISSION",
  emitterCompanyAddress: "EMISSION",
  emitterCompanyContact: "EMISSION",
  emitterCompanyPhone: "EMISSION",
  emitterCompanyMail: "EMISSION",
  emitterCustomInfo: "EMISSION",
  wasteCode: "EMISSION",
  wasteDescription: "EMISSION",
  wasteAdr: "EMISSION",
  weightValue: "EMISSION",
  weightIsEstimate: "EMISSION",
  transporterCompanyName: "TRANSPORT",
  transporterCompanySiret: "TRANSPORT",
  transporterCompanyVatNumber: "TRANSPORT",
  transporterCompanyAddress: "TRANSPORT",
  transporterCompanyContact: "TRANSPORT",
  transporterCompanyPhone: "TRANSPORT",
  transporterCompanyMail: "TRANSPORT",
  transporterCustomInfo: "TRANSPORT",
  transporterRecepisseNumber: "TRANSPORT",
  transporterRecepisseDepartment: "TRANSPORT",
  transporterRecepisseValidityLimit: "TRANSPORT",
  transporterTransportMode: "TRANSPORT",
  transporterTransportPlates: "TRANSPORT",
  transporterTransportTakenOverAt: "TRANSPORT",
  destinationCompanyName: "EMISSION",
  destinationCompanySiret: "EMISSION",
  destinationCompanyAddress: "EMISSION",
  destinationCompanyContact: "EMISSION",
  destinationCompanyPhone: "EMISSION",
  destinationCompanyMail: "EMISSION",
  destinationCap: "EMISSION",
  destinationCustomInfo: "OPERATION",
  destinationReceptionDate: "RECEPTION",
  destinationPlannedOperationCode: "EMISSION"
};

const editableFields = Object.keys(editionRules) as string[];

const editableFieldsAfterEmission = editableFields.filter(
  field => editionRules[field] !== "EMISSION"
);

const editableFieldsAfterTransport = editableFieldsAfterEmission.filter(
  field => editionRules[field] !== "TRANSPORT"
);

export class SealedFieldError extends ForbiddenError {
  constructor(fields: string[]) {
    super(
      `Des champs ont été verrouillés via signature et ne peuvent plus être modifiés : ${fields.join(
        ", "
      )}`
    );
  }
}

// check updated fields are not sealed by signature
async function checkSealedFields(
  flatInput: Prisma.BsffUpdateInput,
  existingBsff: Bsff
) {
  const sealedFieldErrors: string[] = [];

  if (existingBsff.emitterEmissionSignatureDate) {
    for (const field of Object.keys(flatInput)) {
      if (
        !editableFieldsAfterEmission.includes(field) &&
        existingBsff[field] !== flatInput[field]
      ) {
        sealedFieldErrors.push(field);
      }
    }
  }

  if (existingBsff.transporterTransportSignatureDate) {
    for (const field of Object.keys(flatInput)) {
      if (
        !editableFieldsAfterTransport.includes(field) &&
        existingBsff[field] !== flatInput[field]
      ) {
        sealedFieldErrors.push(field);
      }
    }
  }

  if (existingBsff.destinationReceptionSignatureDate) {
    // do not allow any BSFF fields to be updated after reception
    for (const field of Object.keys(flatInput)) {
      sealedFieldErrors.push(field);
    }
  }

  if (sealedFieldErrors.length > 0) {
    throw new SealedFieldError(sealedFieldErrors);
  }
}
