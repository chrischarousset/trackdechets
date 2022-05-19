import {
  Form as PrismaForm,
  TransportSegment as PrismaTransportSegment,
  Prisma,
  BsddRevisionRequest,
  Form
} from "@prisma/client";
import {
  Form as GraphQLForm,
  Appendix2Form as GraphQLAppendix2Form,
  TransportSegment as GraphQLTransportSegment,
  Emitter,
  Recipient,
  Transporter,
  Trader,
  Broker,
  WasteDetails,
  FormStatus,
  WorkSite,
  FormCompany,
  FormEcoOrganisme,
  NextDestination,
  FormInput,
  TemporaryStorageDetailInput,
  EmitterInput,
  ProcessedFormInput,
  DestinationInput,
  WasteDetailsInput,
  TransporterInput,
  RecipientInput,
  TraderInput,
  BrokerInput,
  NextDestinationInput,
  ImportPaperFormInput,
  EcoOrganismeInput,
  PackagingInfo,
  TransporterSignatureFormInput,
  SignatureFormInput,
  ReceivedFormInput,
  NextSegmentInfoInput,
  FormRevisionRequestContentInput,
  FormRevisionRequestContent,
  FormRevisionRequestWasteDetails,
  FormRevisionRequestTemporaryStorageDetail,
  FormRevisionRequestDestination,
  FormRevisionRequestRecipient,
  ParcelNumber,
  Destination
} from "../generated/graphql/types";
import { extractPostalCode } from "../utils";
import prisma from "../prisma";

/**
 * Return null if all object values are null
 * obj otherwise
 */
export function nullIfNoValues<T>(obj: T): T | null {
  return Object.values(obj).some(v => v !== null) ? obj : null;
}

/**
 * Discard undefined fields in a flatten input
 * It is used to prevent overriding existing data when
 * updating records
 */
export function safeInput<K>(obj: K): Partial<K> {
  return Object.keys(obj).reduce((acc, curr) => {
    return {
      ...acc,
      ...(obj[curr] !== undefined ? { [curr]: obj[curr] } : {})
    };
  }, {});
}

/**
 * Equivalent to a typescript optional chaining operator foo?.bar
 * except that it returns "null" instead of "undefined" if "null" is encountered in the chain
 * It allows to differentiate between voluntary null update and field omission that should
 * not update any data
 */
export function chain<T, K>(o: T, getter: (o: T) => K): K | null | undefined {
  if (o === null) {
    return null;
  }
  if (o === undefined) {
    return undefined;
  }
  return getter(o);
}

export function undefinedOrDefault<I>(value: I, defaultValue: I): I {
  if (value === null) {
    return defaultValue;
  }

  return value;
}

function flattenDestinationInput(input: {
  destination?: DestinationInput;
}): Partial<Prisma.FormCreateInput> {
  return {
    recipientCompanyName: chain(input.destination, d =>
      chain(d.company, c => c.name)
    ),
    recipientCompanySiret: chain(input.destination, d =>
      chain(d.company, c => c.siret)
    ),
    recipientCompanyAddress: chain(input.destination, d =>
      chain(d.company, c => c.address)
    ),
    recipientCompanyContact: chain(input.destination, d =>
      chain(d.company, c => c.contact)
    ),
    recipientCompanyPhone: chain(input.destination, d =>
      chain(d.company, c => c.phone)
    ),
    recipientCompanyMail: chain(input.destination, d =>
      chain(d.company, c => c.mail)
    ),
    recipientCap: chain(input.destination, d => d.cap),
    recipientProcessingOperation: chain(
      input.destination,
      d => d.processingOperation
    )
  };
}

function flattenWasteDetailsInput(input: { wasteDetails?: WasteDetailsInput }) {
  return {
    wasteDetailsCode: chain(input.wasteDetails, w => w.code),
    wasteDetailsOnuCode: chain(input.wasteDetails, w => w.onuCode),
    wasteDetailsPackagingInfos: chain(input.wasteDetails, w =>
      getProcessedPackagingInfos(w)
    ),
    wasteDetailsQuantity: chain(input.wasteDetails, w => w.quantity),
    wasteDetailsQuantityType: chain(input.wasteDetails, w => w.quantityType),
    wasteDetailsName: chain(input.wasteDetails, w => w.name),
    wasteDetailsConsistence: chain(input.wasteDetails, w => w.consistence),
    wasteDetailsPop: chain(input.wasteDetails, w => w.pop),
    wasteDetailsIsDangerous: chain(input.wasteDetails, w => w.isDangerous),
    wasteDetailsParcelNumbers: chain(input.wasteDetails, w =>
      undefinedOrDefault(w.parcelNumbers, [])
    ),
    wasteDetailsAnalysisReferences: chain(input.wasteDetails, w =>
      undefinedOrDefault(w.analysisReferences, [])
    ),
    wasteDetailsLandIdentifiers: chain(input.wasteDetails, w =>
      undefinedOrDefault(w.landIdentifiers, [])
    )
  };
}

function flattenTransporterInput(input: { transporter?: TransporterInput }) {
  return {
    transporterCompanyName: chain(input.transporter, t =>
      chain(t.company, c => c.name)
    ),
    transporterCompanySiret: chain(input.transporter, t =>
      chain(t.company, c => c.siret)
    ),
    transporterCompanyAddress: chain(input.transporter, t =>
      chain(t.company, c => c.address)
    ),
    transporterCompanyContact: chain(input.transporter, t =>
      chain(t.company, c => c.contact)
    ),
    transporterCompanyPhone: chain(input.transporter, t =>
      chain(t.company, c => c.phone)
    ),
    transporterCompanyMail: chain(input.transporter, t =>
      chain(t.company, c => c.mail)
    ),
    transporterCompanyVatNumber: chain(input.transporter, t =>
      chain(t.company, c => c.vatNumber)
    ),
    transporterIsExemptedOfReceipt: chain(
      input.transporter,
      t => t.isExemptedOfReceipt
    ),
    transporterReceipt: chain(input.transporter, t => t.receipt),
    transporterDepartment: chain(input.transporter, t => t.department),
    transporterValidityLimit: chain(input.transporter, t => t.validityLimit),
    transporterNumberPlate: chain(input.transporter, t => t.numberPlate),
    transporterCustomInfo: chain(input.transporter, t => t.customInfo),
    transporterTransportMode: chain(input.transporter, t => t.mode)
  };
}

function flattenEmitterInput(input: { emitter?: EmitterInput }) {
  return {
    emitterType: chain(input.emitter, e => e.type),
    emitterPickupSite: chain(input.emitter, e => e.pickupSite),
    emitterWorkSiteName: chain(input.emitter, e =>
      chain(e.workSite, w => w.name)
    ),
    emitterWorkSiteAddress: chain(input.emitter, e =>
      chain(e.workSite, w => w.address)
    ),
    emitterWorkSiteCity: chain(input.emitter, e =>
      chain(e.workSite, w => w.city)
    ),
    emitterWorkSitePostalCode: chain(input.emitter, e =>
      chain(e.workSite, w => w.postalCode)
    ),
    emitterWorkSiteInfos: chain(input.emitter, e =>
      chain(e.workSite, w => w.infos)
    ),
    emitterCompanyName: chain(input.emitter, e =>
      chain(e.company, c => c.name)
    ),
    emitterCompanySiret: chain(input.emitter, e =>
      chain(e.company, c => c.siret)
    ),
    emitterCompanyAddress: chain(input.emitter, e =>
      chain(e.company, c => c.address)
    ),
    emitterCompanyContact: chain(input.emitter, e =>
      chain(e.company, c => c.contact)
    ),
    emitterCompanyPhone: chain(input.emitter, e =>
      chain(e.company, c => c.phone)
    ),
    emitterCompanyMail: chain(input.emitter, e => chain(e.company, c => c.mail))
  };
}

function flattenRecipientInput(input: { recipient?: RecipientInput }) {
  return {
    recipientCap: chain(input.recipient, r => r.cap),
    recipientProcessingOperation: chain(
      input.recipient,
      r => r.processingOperation
    ),
    recipientIsTempStorage: chain(input.recipient, r => r.isTempStorage),
    recipientCompanyName: chain(input.recipient, r =>
      chain(r.company, c => c.name)
    ),
    recipientCompanySiret: chain(input.recipient, r =>
      chain(r.company, c => c.siret)
    ),
    recipientCompanyAddress: chain(input.recipient, r =>
      chain(r.company, c => c.address)
    ),
    recipientCompanyContact: chain(input.recipient, r =>
      chain(r.company, c => c.contact)
    ),
    recipientCompanyPhone: chain(input.recipient, r =>
      chain(r.company, c => c.phone)
    ),
    recipientCompanyMail: chain(input.recipient, r =>
      chain(r.company, c => c.mail)
    )
  };
}

function flattenTraderInput(input: { trader?: TraderInput }) {
  return {
    traderCompanyName: chain(input.trader, t => chain(t.company, c => c.name)),
    traderCompanySiret: chain(input.trader, t =>
      chain(t.company, c => c.siret)
    ),
    traderCompanyAddress: chain(input.trader, t =>
      chain(t.company, c => c.address)
    ),
    traderCompanyContact: chain(input.trader, t =>
      chain(t.company, c => c.contact)
    ),
    traderCompanyPhone: chain(input.trader, t =>
      chain(t.company, c => c.phone)
    ),
    traderCompanyMail: chain(input.trader, t => chain(t.company, c => c.mail)),
    traderReceipt: chain(input.trader, t => t.receipt),
    traderDepartment: chain(input.trader, t => t.department),
    traderValidityLimit: chain(input.trader, t => t.validityLimit)
  };
}

function flattenBrokerInput(input: { broker?: BrokerInput }) {
  return {
    brokerCompanyName: chain(input.broker, t => chain(t.company, c => c.name)),
    brokerCompanySiret: chain(input.broker, t =>
      chain(t.company, c => c.siret)
    ),
    brokerCompanyAddress: chain(input.broker, t =>
      chain(t.company, c => c.address)
    ),
    brokerCompanyContact: chain(input.broker, t =>
      chain(t.company, c => c.contact)
    ),
    brokerCompanyPhone: chain(input.broker, t =>
      chain(t.company, c => c.phone)
    ),
    brokerCompanyMail: chain(input.broker, t => chain(t.company, c => c.mail)),
    brokerReceipt: chain(input.broker, t => t.receipt),
    brokerDepartment: chain(input.broker, t => t.department),
    brokerValidityLimit: chain(input.broker, t =>
      t.validityLimit ? new Date(t.validityLimit) : null
    )
  };
}

function flattenEcoOrganismeInput(input: { ecoOrganisme?: EcoOrganismeInput }) {
  return {
    ecoOrganismeName: chain(input.ecoOrganisme, e => e.name),
    ecoOrganismeSiret: chain(input.ecoOrganisme, e => e.siret)
  };
}

function flattenNextDestinationInput(input: {
  nextDestination?: NextDestinationInput;
}) {
  return {
    nextDestinationProcessingOperation: chain(
      input.nextDestination,
      nd => nd.processingOperation
    ),
    nextDestinationCompanySiret: chain(input.nextDestination, nd =>
      chain(nd.company, c => c.siret)
    ),
    nextDestinationCompanyAddress: chain(input.nextDestination, nd =>
      chain(nd.company, c => c.address)
    ),
    nextDestinationCompanyCountry: chain(input.nextDestination, nd =>
      chain(nd.company, c => c.country)
    ),
    nextDestinationCompanyContact: chain(input.nextDestination, nd =>
      chain(nd.company, c => c.contact)
    ),
    nextDestinationCompanyMail: chain(input.nextDestination, nd =>
      chain(nd.company, c => c.mail)
    ),
    nextDestinationCompanyName: chain(input.nextDestination, nd =>
      chain(nd.company, c => c.name)
    ),
    nextDestinationCompanyPhone: chain(input.nextDestination, nd =>
      chain(nd.company, c => c.phone)
    )
  };
}

export function flattenBsddRevisionRequestInput(
  reviewContent: FormRevisionRequestContentInput
) {
  return safeInput({
    recipientCap: chain(reviewContent, c => chain(c.recipient, r => r.cap)),
    wasteDetailsCode: chain(reviewContent, c =>
      chain(c.wasteDetails, w => w.code)
    ),
    wasteDetailsName: chain(reviewContent, c =>
      chain(c.wasteDetails, w => w.name)
    ),
    wasteDetailsPop: chain(reviewContent, c =>
      chain(c.wasteDetails, w => w.pop)
    ),
    wasteDetailsPackagingInfos: chain(reviewContent, c =>
      chain(c.wasteDetails, w => w.packagingInfos)
    ),
    quantityReceived: chain(reviewContent, c => c.quantityReceived),
    processingOperationDone: chain(
      reviewContent,
      c => c.processingOperationDone
    ),
    processingOperationDescription: chain(
      reviewContent,
      c => c.processingOperationDescription
    ),
    ...flattenTraderInput(reviewContent),
    ...flattenBrokerInput(reviewContent),
    temporaryStorageDestinationCap: chain(reviewContent, c =>
      chain(c.temporaryStorageDetail, t => chain(t.destination, d => d.cap))
    ),
    temporaryStorageDestinationProcessingOperation: chain(reviewContent, c =>
      chain(c.temporaryStorageDetail, t =>
        chain(t.destination, d => d.processingOperation)
      )
    )
  });
}

export function flattenFormInput(
  formInput: Pick<
    FormInput,
    | "customId"
    | "emitter"
    | "recipient"
    | "transporter"
    | "wasteDetails"
    | "trader"
    | "broker"
    | "ecoOrganisme"
  >
): Partial<Omit<Prisma.FormCreateInput, "temporaryStorageDetail">> {
  return safeInput({
    customId: formInput.customId,
    ...flattenEmitterInput(formInput),
    ...flattenRecipientInput(formInput),
    ...flattenTransporterInput(formInput),
    ...flattenWasteDetailsInput(formInput),
    ...flattenTraderInput(formInput),
    ...flattenBrokerInput(formInput),
    ...flattenEcoOrganismeInput(formInput)
  });
}

export function flattenProcessedFormInput(
  processedFormInput: ProcessedFormInput
): Partial<Prisma.FormCreateInput> {
  const { nextDestination, ...rest } = processedFormInput;
  return safeInput({
    ...rest,
    ...flattenNextDestinationInput(processedFormInput)
  });
}

export function flattenImportPaperFormInput(
  input: ImportPaperFormInput
): Partial<Prisma.FormCreateInput> {
  const { id, customId, signingInfo, receivedInfo, processedInfo, ...rest } =
    input;

  return safeInput({
    id,
    customId,
    ...flattenEmitterInput(rest),
    ...flattenEcoOrganismeInput(rest),
    ...flattenRecipientInput(rest),
    ...flattenTransporterInput(rest),
    ...flattenWasteDetailsInput(rest),
    ...flattenTraderInput(rest),
    ...flattenBrokerInput(rest),
    ...flattenSigningInfo(signingInfo),
    ...flattenReceivedInfo(receivedInfo),
    ...flattenProcessedFormInput(processedInfo)
  });
}

function flattenSigningInfo(signingInfo: SignatureFormInput) {
  return safeInput(signingInfo);
}

function flattenReceivedInfo(receivedInfo: ReceivedFormInput) {
  return safeInput(receivedInfo);
}

export function flattenTemporaryStorageDetailInput(
  tempStorageInput: TemporaryStorageDetailInput
): Partial<Prisma.FormCreateInput> {
  return safeInput(flattenDestinationInput(tempStorageInput));
}

export function flattenSignedByTransporterInput(
  transporterSignatureFormInput: TransporterSignatureFormInput
) {
  return safeInput({
    ...transporterSignatureFormInput,
    packagingInfos: getProcessedPackagingInfos(transporterSignatureFormInput)
  });
}

export function flattenTransportSegmentInput(
  segmentInput: NextSegmentInfoInput
) {
  return safeInput({
    transporterCompanySiret: chain(segmentInput.transporter, t =>
      chain(t.company, c => c.siret)
    ),
    transporterCompanyName: chain(segmentInput.transporter, t =>
      chain(t.company, c => c.name)
    ),
    transporterCompanyAddress: chain(segmentInput.transporter, t =>
      chain(t.company, c => c.address)
    ),
    transporterCompanyContact: chain(segmentInput.transporter, t =>
      chain(t.company, c => c.contact)
    ),
    transporterCompanyMail: chain(segmentInput.transporter, t =>
      chain(t.company, c => c.mail)
    ),
    transporterCompanyPhone: chain(segmentInput.transporter, t =>
      chain(t.company, c => c.phone)
    ),
    transporterIsExemptedOfReceipt: chain(
      segmentInput.transporter,
      t => t.isExemptedOfReceipt
    ),
    transporterReceipt: chain(segmentInput.transporter, t => t.receipt),
    transporterDepartment: chain(segmentInput.transporter, t => t.department),
    transporterNumberPlate: chain(segmentInput.transporter, t => t.numberPlate),
    transporterValidityLimit: chain(
      segmentInput.transporter,
      t => t.validityLimit
    ),
    mode: segmentInput.mode
  });
}

/**
 * Expand form data from db
 */
export async function expandFormFromDb(form: PrismaForm): Promise<GraphQLForm> {
  const forwardedIn: Form = form.forwardedInId
    ? await prisma.form.findUnique({ where: { id: form.id } }).forwardedIn()
    : null;

  return {
    id: form.id,
    readableId: form.readableId,
    customId: form.customId,
    isImportedFromPaper: form.isImportedFromPaper,
    emitter: nullIfNoValues<Emitter>({
      type: form.emitterType,
      workSite: nullIfNoValues<WorkSite>({
        name: form.emitterWorkSiteName,
        address: form.emitterWorkSiteAddress,
        city: form.emitterWorkSiteCity,
        postalCode: form.emitterWorkSitePostalCode,
        infos: form.emitterWorkSiteInfos
      }),
      pickupSite: form.emitterPickupSite,
      company: nullIfNoValues<FormCompany>({
        name: form.emitterCompanyName,
        siret: form.emitterCompanySiret,
        address: form.emitterCompanyAddress,
        contact: form.emitterCompanyContact,
        phone: form.emitterCompanyPhone,
        mail: form.emitterCompanyMail
      })
    }),
    recipient: nullIfNoValues<Recipient>({
      cap: form.recipientCap,
      processingOperation: form.recipientProcessingOperation,
      company: nullIfNoValues<FormCompany>({
        name: form.recipientCompanyName,
        siret: form.recipientCompanySiret,
        address: form.recipientCompanyAddress,
        contact: form.recipientCompanyContact,
        phone: form.recipientCompanyPhone,
        mail: form.recipientCompanyMail
      }),
      isTempStorage: form.recipientIsTempStorage
    }),
    transporter: nullIfNoValues<Transporter>({
      company: nullIfNoValues<FormCompany>({
        name: form.transporterCompanyName,
        siret: form.transporterCompanySiret,
        vatNumber: form.transporterCompanyVatNumber,
        address: form.transporterCompanyAddress,
        contact: form.transporterCompanyContact,
        phone: form.transporterCompanyPhone,
        mail: form.transporterCompanyMail
      }),
      isExemptedOfReceipt: form.transporterIsExemptedOfReceipt,
      receipt: form.transporterReceipt,
      department: form.transporterDepartment,
      validityLimit: form.transporterValidityLimit,
      numberPlate: form.transporterNumberPlate,
      customInfo: form.transporterCustomInfo,
      // transportMode has default value in DB but we do not want to return anything
      // if the transporter siret is not defined
      mode: form.transporterCompanySiret ? form.transporterTransportMode : null
    }),
    wasteDetails: nullIfNoValues<WasteDetails>({
      code: form.wasteDetailsCode,
      name: form.wasteDetailsName,
      onuCode: form.wasteDetailsOnuCode,
      packagingInfos: form.wasteDetailsPackagingInfos as PackagingInfo[],
      // DEPRECATED - To remove with old packaging fields
      ...getDeprecatedPackagingApiFields(
        form.wasteDetailsPackagingInfos as PackagingInfo[]
      ),
      quantity: form.wasteDetailsQuantity,
      quantityType: form.wasteDetailsQuantityType,
      consistence: form.wasteDetailsConsistence,
      pop: form.wasteDetailsPop,
      isDangerous: form.wasteDetailsIsDangerous,
      parcelNumbers: form.wasteDetailsParcelNumbers as ParcelNumber[],
      analysisReferences: form.wasteDetailsAnalysisReferences,
      landIdentifiers: form.wasteDetailsLandIdentifiers
    }),
    trader: nullIfNoValues<Trader>({
      company: nullIfNoValues<FormCompany>({
        name: form.traderCompanyName,
        siret: form.traderCompanySiret,
        address: form.traderCompanyAddress,
        contact: form.traderCompanyContact,
        phone: form.traderCompanyPhone,
        mail: form.traderCompanyMail
      }),
      receipt: form.traderReceipt,
      department: form.traderDepartment,
      validityLimit: form.traderValidityLimit
    }),
    broker: nullIfNoValues<Broker>({
      company: nullIfNoValues<FormCompany>({
        name: form.brokerCompanyName,
        siret: form.brokerCompanySiret,
        address: form.brokerCompanyAddress,
        contact: form.brokerCompanyContact,
        phone: form.brokerCompanyPhone,
        mail: form.brokerCompanyMail
      }),
      receipt: form.brokerReceipt,
      department: form.brokerDepartment,
      validityLimit: form.brokerValidityLimit
    }),
    ecoOrganisme: nullIfNoValues<FormEcoOrganisme>({
      name: form.ecoOrganismeName,
      siret: form.ecoOrganismeSiret
    }),
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
    status: form.status as FormStatus,
    emittedAt: form.emittedAt,
    emittedBy: form.emittedBy,
    emittedByEcoOrganisme: form.emittedByEcoOrganisme,
    takenOverAt: form.takenOverAt,
    takenOverBy: form.takenOverBy,
    signedByTransporter: form.signedByTransporter,
    sentAt: form.sentAt,
    sentBy: form.sentBy,
    wasteAcceptationStatus: forwardedIn
      ? forwardedIn.wasteAcceptationStatus
      : form.wasteAcceptationStatus,
    wasteRefusalReason: forwardedIn
      ? forwardedIn.wasteRefusalReason
      : form.wasteRefusalReason,
    receivedBy: forwardedIn ? forwardedIn.receivedBy : form.receivedBy,
    receivedAt: forwardedIn ? forwardedIn.receivedAt : form.receivedAt,
    signedAt: forwardedIn ? forwardedIn.signedAt : form.signedAt,
    quantityReceived: forwardedIn
      ? forwardedIn.quantityReceived
      : form.quantityReceived,
    quantityGrouped: form.quantityGrouped,
    processingOperationDone: forwardedIn
      ? forwardedIn.processingOperationDone
      : form.processingOperationDone,
    processingOperationDescription: forwardedIn
      ? forwardedIn.processingOperationDescription
      : form.processingOperationDescription,
    processedBy: forwardedIn ? forwardedIn.processedBy : form.processedBy,
    processedAt: forwardedIn ? forwardedIn.processedAt : form.processedAt,
    noTraceability: forwardedIn
      ? forwardedIn.noTraceability
      : form.noTraceability,
    nextDestination: forwardedIn
      ? nullIfNoValues<NextDestination>({
          processingOperation: forwardedIn.nextDestinationProcessingOperation,
          company: nullIfNoValues<FormCompany>({
            name: forwardedIn.nextDestinationCompanyName,
            siret: forwardedIn.nextDestinationCompanySiret,
            address: forwardedIn.nextDestinationCompanyAddress,
            country: forwardedIn.nextDestinationCompanyCountry,
            contact: forwardedIn.nextDestinationCompanyContact,
            phone: forwardedIn.nextDestinationCompanyPhone,
            mail: forwardedIn.nextDestinationCompanyMail
          })
        })
      : nullIfNoValues<NextDestination>({
          processingOperation: form.nextDestinationProcessingOperation,
          company: nullIfNoValues<FormCompany>({
            name: form.nextDestinationCompanyName,
            siret: form.nextDestinationCompanySiret,
            address: form.nextDestinationCompanyAddress,
            country: form.nextDestinationCompanyCountry,
            contact: form.nextDestinationCompanyContact,
            phone: form.nextDestinationCompanyPhone,
            mail: form.nextDestinationCompanyMail
          })
        }),
    currentTransporterSiret: form.currentTransporterSiret,
    nextTransporterSiret: form.nextTransporterSiret,
    intermediaries: [],
    temporaryStorageDetail: forwardedIn
      ? {
          temporaryStorer: {
            quantityType: form.quantityReceivedType,
            quantityReceived: form.quantityReceived,
            wasteAcceptationStatus: form.wasteAcceptationStatus,
            wasteRefusalReason: form.wasteRefusalReason,
            receivedAt: form.receivedAt,
            receivedBy: form.receivedBy
          },
          destination: nullIfNoValues<Destination>({
            cap: forwardedIn.recipientCap,
            processingOperation: forwardedIn.recipientProcessingOperation,
            company: nullIfNoValues<FormCompany>({
              name: forwardedIn.recipientCompanyName,
              siret: forwardedIn.recipientCompanySiret,
              address: forwardedIn.recipientCompanyAddress,
              contact: forwardedIn.recipientCompanyContact,
              phone: forwardedIn.recipientCompanyPhone,
              mail: forwardedIn.recipientCompanyMail
            }),
            isFilledByEmitter: false // DEPRECATED, always returns false
          }),
          wasteDetails: nullIfNoValues<WasteDetails>({
            code: forwardedIn.wasteDetailsCode,
            name: forwardedIn.wasteDetailsName,
            onuCode: forwardedIn.wasteDetailsOnuCode,
            packagingInfos:
              forwardedIn.wasteDetailsPackagingInfos as PackagingInfo[],
            // DEPRECATED - To remove with old packaging fields
            ...getDeprecatedPackagingApiFields(
              forwardedIn.wasteDetailsPackagingInfos as PackagingInfo[]
            ),
            quantity: forwardedIn.wasteDetailsQuantity,
            quantityType: forwardedIn.wasteDetailsQuantityType,
            consistence: forwardedIn.wasteDetailsConsistence,
            pop: forwardedIn.wasteDetailsPop,
            isDangerous: forwardedIn.wasteDetailsIsDangerous
          }),
          transporter: nullIfNoValues<Transporter>({
            company: nullIfNoValues<FormCompany>({
              name: forwardedIn.transporterCompanyName,
              siret: forwardedIn.transporterCompanySiret,
              vatNumber: forwardedIn.transporterCompanyVatNumber,
              address: forwardedIn.transporterCompanyAddress,
              contact: forwardedIn.transporterCompanyContact,
              phone: forwardedIn.transporterCompanyPhone,
              mail: forwardedIn.transporterCompanyMail
            }),
            isExemptedOfReceipt: forwardedIn.transporterIsExemptedOfReceipt,
            receipt: forwardedIn.transporterReceipt,
            department: forwardedIn.transporterDepartment,
            validityLimit: forwardedIn.transporterValidityLimit,
            numberPlate: forwardedIn.transporterNumberPlate,
            customInfo: forwardedIn.transporterCustomInfo,
            // transportMode has default value in DB but we do not want to return anything
            // if the transporter siret is not defined
            mode: forwardedIn.transporterCompanySiret
              ? forwardedIn.transporterTransportMode
              : null
          }),
          emittedAt: forwardedIn.emittedAt,
          emittedBy: forwardedIn.emittedBy,
          takenOverAt: forwardedIn.takenOverAt,
          takenOverBy: forwardedIn.takenOverBy,
          // Deprecated: Remplacé par takenOverAt
          signedAt: forwardedIn.takenOverAt,
          // Deprecated: Remplacé par emittedBy
          signedBy: forwardedIn.emittedBy
        }
      : null
  };
}

export async function expandAppendix2FormFromDb(
  prismaForm: PrismaForm
): Promise<GraphQLAppendix2Form> {
  const {
    id,
    readableId,
    wasteDetails,
    emitter,
    recipient,
    signedAt,
    quantityReceived,
    processingOperationDone,
    quantityGrouped
  } = await expandFormFromDb(prismaForm);

  const hasPickupSite = emitter?.workSite?.postalCode?.length > 0;

  return {
    id,
    readableId,
    wasteDetails,
    emitter,
    emitterPostalCode: hasPickupSite
      ? emitter?.workSite?.postalCode
      : extractPostalCode(emitter?.company?.address),
    signedAt,
    recipient,
    quantityReceived,
    quantityGrouped,
    processingOperationDone
  };
}

export function expandTransportSegmentFromDb(
  segment: PrismaTransportSegment
): GraphQLTransportSegment {
  return {
    id: segment.id,
    previousTransporterCompanySiret: segment.previousTransporterCompanySiret,
    transporter: nullIfNoValues({
      company: nullIfNoValues({
        name: segment.transporterCompanyName,
        siret: segment.transporterCompanySiret,
        address: segment.transporterCompanyAddress,
        contact: segment.transporterCompanyContact,
        phone: segment.transporterCompanyPhone,
        mail: segment.transporterCompanyMail
      }),
      isExemptedOfReceipt: segment.transporterIsExemptedOfReceipt,
      receipt: segment.transporterReceipt,
      department: segment.transporterDepartment,
      validityLimit: segment.transporterValidityLimit,
      numberPlate: segment.transporterNumberPlate,
      customInfo: null
    }),
    mode: segment.mode,
    takenOverAt: segment.takenOverAt,
    takenOverBy: segment.takenOverBy,
    readyToTakeOver: segment.readyToTakeOver,
    segmentNumber: segment.segmentNumber
  };
}

export function expandBsddRevisionRequestContent(
  bsddRevisionRequest: BsddRevisionRequest
): FormRevisionRequestContent {
  return {
    wasteDetails: nullIfNoValues<FormRevisionRequestWasteDetails>({
      code: bsddRevisionRequest.wasteDetailsCode,
      name: bsddRevisionRequest.wasteDetailsName,
      pop: bsddRevisionRequest.wasteDetailsPop,
      packagingInfos:
        bsddRevisionRequest.wasteDetailsPackagingInfos as PackagingInfo[]
    }),
    trader: nullIfNoValues<Trader>({
      company: nullIfNoValues<FormCompany>({
        name: bsddRevisionRequest.traderCompanyName,
        siret: bsddRevisionRequest.traderCompanySiret,
        address: bsddRevisionRequest.traderCompanyAddress,
        contact: bsddRevisionRequest.traderCompanyContact,
        phone: bsddRevisionRequest.traderCompanyPhone,
        mail: bsddRevisionRequest.traderCompanyMail
      }),
      receipt: bsddRevisionRequest.traderReceipt,
      department: bsddRevisionRequest.traderDepartment,
      validityLimit: bsddRevisionRequest.traderValidityLimit
    }),
    broker: nullIfNoValues<Broker>({
      company: nullIfNoValues<FormCompany>({
        name: bsddRevisionRequest.brokerCompanyName,
        siret: bsddRevisionRequest.brokerCompanySiret,
        address: bsddRevisionRequest.brokerCompanyAddress,
        contact: bsddRevisionRequest.brokerCompanyContact,
        phone: bsddRevisionRequest.brokerCompanyPhone,
        mail: bsddRevisionRequest.brokerCompanyMail
      }),
      receipt: bsddRevisionRequest.brokerReceipt,
      department: bsddRevisionRequest.brokerDepartment,
      validityLimit: bsddRevisionRequest.brokerValidityLimit
    }),
    recipient: nullIfNoValues<FormRevisionRequestRecipient>({
      cap: bsddRevisionRequest.recipientCap
    }),
    quantityReceived: bsddRevisionRequest.quantityReceived,
    processingOperationDone: bsddRevisionRequest.processingOperationDone,
    processingOperationDescription:
      bsddRevisionRequest.processingOperationDescription,
    temporaryStorageDetail:
      nullIfNoValues<FormRevisionRequestTemporaryStorageDetail>({
        destination: nullIfNoValues<FormRevisionRequestDestination>({
          cap: bsddRevisionRequest.temporaryStorageDestinationCap,
          processingOperation:
            bsddRevisionRequest.temporaryStorageDestinationProcessingOperation
        })
      })
  };
}

/**
 * `packagings`, `otherPackaging` and `numberOfPackages` are DEPRECATED
 * For retro compatibility, calculate their values by reading `packagingInfos`
 * @param packagingInfos
 */
function getDeprecatedPackagingApiFields(packagingInfos: PackagingInfo[]) {
  return {
    packagings: chain(packagingInfos, pi => pi.map(pi => pi.type)),
    otherPackaging: chain(
      packagingInfos,
      pi => pi.find(pi => pi.type === "AUTRE")?.other
    ),
    numberOfPackages: chain(packagingInfos, pi =>
      pi.reduce((prev, cur) => prev + cur.quantity, 0)
    )
  };
}

/**
 * `packagings`, `otherPackaging` and `numberOfPackages` are DEPRECATED
 * But they can still be passed as input instead of `packagingInfos`
 * So we calculate the `packagingInfos` to store in DB based on their values
 * @param wasteDetails
 */
function getProcessedPackagingInfos(wasteDetails: Partial<WasteDetailsInput>) {
  // if deprecated `packagings` field is passed and `packagingInfos` is not passed
  // convert old packagings to new packaging info
  if (wasteDetails.packagings && !wasteDetails.packagingInfos) {
    const packagings = wasteDetails.packagings;
    const numberOfPackages = wasteDetails.numberOfPackages ?? 1;
    const maxPackagesPerPackaging = Math.ceil(
      numberOfPackages / packagings.length
    );

    return packagings.map((type, idx) => ({
      type,
      other: type === "AUTRE" ? wasteDetails.otherPackaging : null,
      quantity: Math.max(
        0,
        Math.min(
          maxPackagesPerPackaging,
          numberOfPackages - maxPackagesPerPackaging * idx
        )
      )
    }));
  }

  // Otherwise return packagingInfos "as is".
  // Always default to an empty array to avoid unhandled `null` for JSON fields in prisma
  return undefinedOrDefault(wasteDetails.packagingInfos, []);
}
