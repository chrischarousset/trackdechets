import { string, object, date, number, array, setLocale, LocaleObject } from "yup";

setLocale({
  mixed: {
    default: '${path} est invalide',
    required: '${path} est un champ requis et doit avoir une valeur',
    notType: "${path} ne peut pas être null"
  },
} as LocaleObject);

const companySchema = (type: string) =>
  object().shape({
    name: string().required(),
    siret: string().required(
      `${type}: La sélection d'une entreprise par SIRET est obligatoire`
    ),
    address: string().required(),
    contact: string().required(
      `${type}: Le contact dans l'entreprise est obligatoire`
    ),
    phone: string().required(
      `${type}: Le téléphone de l'entreprise est obligatoire`
    ),
    mail: string().required(`${type}: L'email de l'entreprise est obligatoire`)
  });

const packagingSchema = string().matches(/(FUT|GRV|CITERNE|BENNE|AUTRE)/);

export const formSchema = object<any>().shape({
  id: string().required(),
  emitter: object().shape({
    type: string().matches(/(PRODUCER|OTHER|APPENDIX2)/),
    pickupSite: string().nullable(true),
    company: companySchema("Émetteur")
  }),
  recipient: object().shape({
    processingOperation: string().required(),
    cap: string().nullable(true),
    company: companySchema("Destinataire")
  }),
  transporter: object().shape({
    receipt: string().required(
      "Le numéro de récépissé du transporteur est obligatoire"
    ),
    department: string().required(
      "Le département du transporteur est obligatoire"
    ),
    validityLimit: date().nullable(true),
    numberPlate: string().nullable(true),
    company: companySchema("Transporteur")
  }),
  wasteDetails: object().shape({
    code: string().required("Code déchet manquant"),
    onuCode: string(),
    packagings: array().of(packagingSchema),
    otherPackaging: string().nullable(true),
    numberOfPackages: number()
      .integer()
      .min(1, "Le nombre de colis doit être supérieur à 0")
      .nullable(true),
    quantity: number().min(0, "La quantité doit être supérieure à 0"),
    quantityType: string().matches(
      /(REAL|ESTIMATED)/,
      "Le type de quantité (réelle ou estimée) doit être précisé"
    ),
    consistence: string().matches(
      /(SOLID|LIQUID|GASEOUS)/,
      "La consistance du déchet doit être précisée"
    )
  })
});
