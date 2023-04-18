import { resetDatabase } from "../../../../../integration-tests/helper";
import {
  Query,
  QueryFormRevisionRequestsArgs
} from "../../../../generated/graphql/types";
import prisma from "../../../../prisma";
import {
  formFactory,
  userWithCompanyFactory
} from "../../../../__tests__/factories";
import makeClient from "../../../../__tests__/testClient";

const FORM_REVISION_REQUESTS = `
  query FormRevisionRequests($siret: String!, $where:FormRevisionRequestWhere) {
    formRevisionRequests(siret: $siret, where: $where) {
      totalCount
      pageInfo {
        hasNextPage
        startCursor
      }
      edges {
        node {
          id
          form {
            id
          }
          status
        }
      }
    }
  }
`;

describe("Mutation.formRevisionRequests", () => {
  afterEach(() => resetDatabase());

  it("should list every revisionRequest from and to company", async () => {
    const { user, company } = await userWithCompanyFactory("ADMIN");
    const { company: otherCompany } = await userWithCompanyFactory("ADMIN");
    const { query } = makeClient(user);

    const bsdd1 = await formFactory({
      ownerId: user.id,
      opt: { emitterCompanySiret: company.siret }
    });
    const bsdd2 = await formFactory({
      ownerId: user.id,
      opt: { recipientCompanySiret: company.siret }
    });

    // 2 unsettled
    await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd1.id,
        authoringCompanyId: otherCompany.id,
        approvals: { create: { approverSiret: company.siret! } },
        comment: ""
      }
    });
    await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd2.id,
        authoringCompanyId: company.id,
        approvals: { create: { approverSiret: otherCompany.siret! } },
        comment: ""
      }
    });

    // 2 settled revisionRequests
    await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd2.id,
        authoringCompanyId: company.id,
        approvals: {
          create: {
            approverSiret: otherCompany.siret!,
            status: "ACCEPTED"
          }
        },
        comment: ""
      }
    });
    await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd2.id,
        authoringCompanyId: company.id,
        approvals: {
          create: {
            approverSiret: otherCompany.siret!,
            status: "REFUSED"
          }
        },
        comment: ""
      }
    });

    const { data } = await query<Pick<Query, "formRevisionRequests">>(
      FORM_REVISION_REQUESTS,
      {
        variables: { siret: company.siret }
      }
    );

    expect(data.formRevisionRequests.totalCount).toBe(4);
    expect(data.formRevisionRequests.pageInfo.hasNextPage).toBe(false);
  });

  it("should fail if requesting a siret current user is not part of", async () => {
    const { user } = await userWithCompanyFactory("ADMIN");
    const { company } = await userWithCompanyFactory("ADMIN");
    const { query } = makeClient(user);

    const { errors } = await query<Pick<Query, "formRevisionRequests">>(
      FORM_REVISION_REQUESTS,
      {
        variables: { siret: company.siret }
      }
    );

    expect(errors[0].message).toBe(
      `Vous n'avez pas la permission de lister les demandes de révision de l'établissement ${company.siret}`
    );
  });

  it("should filter based on status", async () => {
    const { user, company } = await userWithCompanyFactory("ADMIN");

    const bsdd = await formFactory({
      ownerId: user.id,
      opt: { emitterCompanySiret: company.siret }
    });

    // should be included
    const bsdd1RevisionRequest = await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd.id,
        authoringCompanyId: company.id,
        approvals: { create: { approverSiret: company.siret! } },
        comment: "",
        status: "ACCEPTED"
      }
    });

    // should not be included
    await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd.id,
        authoringCompanyId: company.id,
        approvals: { create: { approverSiret: company.siret! } },
        comment: "",
        status: "REFUSED"
      }
    });

    const { query } = makeClient(user);

    const { data } = await query<
      Pick<Query, "formRevisionRequests">,
      QueryFormRevisionRequestsArgs
    >(FORM_REVISION_REQUESTS, {
      variables: { siret: company.siret, where: { status: "ACCEPTED" } }
    });

    expect(data.formRevisionRequests.totalCount).toBe(1);
    expect(data.formRevisionRequests.edges.map(_ => _.node)[0].id).toEqual(
      bsdd1RevisionRequest.id
    );
  });

  it("should filter based on bsddId", async () => {
    const { user, company } = await userWithCompanyFactory("ADMIN");

    const bsdd1 = await formFactory({
      ownerId: user.id,
      opt: { emitterCompanySiret: company.siret }
    });

    const bsdd2 = await formFactory({
      ownerId: user.id,
      opt: { emitterCompanySiret: company.siret }
    });

    // should be included
    const bsdd1RevisionRequest = await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd1.id,
        authoringCompanyId: company.id,
        approvals: { create: { approverSiret: company.siret! } },
        comment: "",
        status: "ACCEPTED"
      }
    });

    // should not be included
    await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd2.id,
        authoringCompanyId: company.id,
        approvals: { create: { approverSiret: company.siret! } },
        comment: "",
        status: "ACCEPTED"
      }
    });

    const { query } = makeClient(user);

    const { data } = await query<
      Pick<Query, "formRevisionRequests">,
      QueryFormRevisionRequestsArgs
    >(FORM_REVISION_REQUESTS, {
      variables: { siret: company.siret, where: { bsddId: { _eq: bsdd1.id } } }
    });

    expect(data.formRevisionRequests.totalCount).toBe(1);
    expect(data.formRevisionRequests.edges.map(_ => _.node)[0].id).toEqual(
      bsdd1RevisionRequest.id
    );
  });
});
