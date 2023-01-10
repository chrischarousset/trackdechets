import { User, Company } from "@prisma/client";
import { getCompanyAdminUsers } from "../companies/database";
import { NotCompanyAdmin, NotCompanyMember } from "../common/errors";
import { getCachedUserSiretOrVat } from "../common/redis/users";

export async function checkIsCompanyAdmin(user: User, company: Company) {
  const admins = await getCompanyAdminUsers(company.orgId);
  if (!admins.map(u => u.id).includes(user.id)) {
    throw new NotCompanyAdmin(company.orgId);
  }
  return true;
}

/**
 * Search by SIRET or VAT number if a user is member of a company
 */
export async function checkIsCompanyMember(
  { id }: { id: string },
  { orgId }: { orgId: string }
) {
  const userCompaniesSiretOrVat = await getCachedUserSiretOrVat(id);

  const isCompanyMember = userCompaniesSiretOrVat.includes(orgId);

  if (isCompanyMember) {
    return true;
  }

  throw new NotCompanyMember(orgId);
}
