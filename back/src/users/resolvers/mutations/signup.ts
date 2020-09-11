import { hash } from "bcrypt";
import * as yup from "yup";
import { sendMail } from "../../../common/mails.helper";
import { User, prisma } from "../../../generated/prisma-client";
import { userMails } from "../../mails";
import { hashPassword } from "../../utils";
import { sanitizeEmail, legacySanitizeEmail } from "../../../utils";
import { UserInputError } from "apollo-server-express";
import {
  MutationResolvers,
  MutationSignupArgs
} from "../../../generated/graphql/types";

export const signupSchema = yup.object({
  userInfos: yup.object({
    email: yup
      .string()
      .email("L'email saisi n'est pas conforme.")
      .required("Vous devez saisir un email."),
    password: yup
      .string()
      .required("Vous devez saisir un mot de passe.")
      .min(8, "Le mot de passe doit faire au moins 8 caractères")
  })
});

function validateArgs(args: MutationSignupArgs) {
  signupSchema.validateSync(args);
  return args;
}

export async function signupFn({
  userInfos: { name, password, phone, email: unsafeEmail }
}: MutationSignupArgs) {
  const userExists = await prisma.$exists.user({
    email_in: [legacySanitizeEmail(unsafeEmail), sanitizeEmail(unsafeEmail)]
  });

  if (userExists) {
    throw new UserInputError(
      "Impossible de créer cet utilisateur. Cet email a déjà un compte"
    );
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.createUser({
    name,
    email: sanitizeEmail(unsafeEmail),
    password: hashedPassword,
    phone
  });

  const userActivationHash = await createActivationHash(user);
  await acceptNewUserCompanyInvitations(user);
  await sendMail(userMails.onSignup(user, userActivationHash.hash));

  return user;
}

const signupResolver: MutationResolvers["signup"] = async (parent, args) => {
  const validArgs = validateArgs(args);
  return signupFn(validArgs);
};

/**
 * On signup we create an activation hash.
 * This hash must be validated before accessing the account.
 * This is to make sure we have a valid email.
 *
 * @param user
 */
async function createActivationHash(user: User) {
  const activationHash = await hash(
    new Date().valueOf().toString() + Math.random().toString(),
    10
  );
  return prisma.createUserActivationHash({
    hash: activationHash,
    user: {
      connect: { id: user.id }
    }
  });
}

/**
 * If the user has pending invitations, validate them all at once on signup
 *
 * @param user
 */
export async function acceptNewUserCompanyInvitations(user: User) {
  const existingHashes = await prisma
    .userAccountHashes({ where: { email: user.email } })
    .catch(() => {
      throw new Error("Technical error.");
    });

  if (!existingHashes.length) {
    return Promise.resolve();
  }

  await Promise.all(
    existingHashes.map(existingHash =>
      prisma.createCompanyAssociation({
        company: { connect: { siret: existingHash.companySiret } },
        user: { connect: { id: user.id } },
        role: existingHash.role
      })
    )
  );

  return prisma.deleteManyUserAccountHashes({
    id_in: existingHashes.map(h => h.id)
  });
}

export default signupResolver;