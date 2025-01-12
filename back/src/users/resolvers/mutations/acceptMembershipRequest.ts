import { applyAuthStrategies, AuthType } from "../../../auth";
import { sendMail } from "../../../mailer/mailing";
import { checkIsAuthenticated } from "../../../common/permissions";
import { MutationResolvers } from "../../../generated/graphql/types";
import prisma from "../../../prisma";
import {
  associateUserToCompany,
  getMembershipRequestOrNotFoundError
} from "../../database";
import {
  MembershipRequestAlreadyAccepted,
  MembershipRequestAlreadyRefused
} from "../../errors";
import { checkIsCompanyAdmin } from "../../permissions";
import { convertUrls } from "../../../companies/database";
import { renderMail } from "../../../mailer/templates/renderers";
import { membershipRequestAccepted } from "../../../mailer/templates";

const acceptMembershipRequestResolver: MutationResolvers["acceptMembershipRequest"] =
  async (parent, { id, role }, context) => {
    applyAuthStrategies(context, [AuthType.Session]);

    const user = checkIsAuthenticated(context);

    // throw error if membership request does not exist
    const membershipRequest = await getMembershipRequestOrNotFoundError({ id });

    const company = await prisma.membershipRequest
      .findUnique({ where: { id: membershipRequest.id } })
      .company();

    // check authenticated user is admin of the company
    await checkIsCompanyAdmin(user, company);

    // throw error if membership request was already accepted
    if (membershipRequest.status === "ACCEPTED") {
      throw new MembershipRequestAlreadyAccepted();
    }

    // throw error if membership request was already refused
    if (membershipRequest.status === "REFUSED") {
      throw new MembershipRequestAlreadyRefused();
    }

    const requester = await prisma.membershipRequest
      .findUnique({ where: { id: membershipRequest.id } })
      .user();

    // associate membership requester to company with the role decided by the admin
    await associateUserToCompany(requester.id, company.siret, role);

    await prisma.membershipRequest.update({
      where: { id },
      data: {
        status: "ACCEPTED",
        statusUpdatedBy: user.email
      }
    });

    // notify requester of acceptance
    const mail = renderMail(membershipRequestAccepted, {
      variables: { companyName: company.name, companySiret: company.siret },
      to: [{ name: requester.name, email: requester.email }]
    });
    await sendMail(mail);

    const dbCompany = await prisma.company.findUnique({
      where: { id: company.id }
    });
    return convertUrls(dbCompany);
  };

export default acceptMembershipRequestResolver;
