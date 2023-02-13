import { resetDatabase } from "../../../integration-tests/helper";
import { bsdasriFactory, initialData } from "./factories";
import { BsdasriType } from "@prisma/client";
import {
  companyFactory,
  userWithCompanyFactory
} from "../../__tests__/factories";
describe("Test Factories", () => {
  afterEach(resetDatabase);

  test("should create a bsdasri", async () => {
    const dasri = await bsdasriFactory({
      opt: { emitterCompanyName: "somecompany" }
    });

    expect(dasri.id).toBeTruthy();
    expect(dasri.status).toEqual("INITIAL");
    expect(dasri.isDraft).toEqual(false);
  });

  test("should denormalize synthesis bsdasri", async () => {
    const { company: initialCompany } = await userWithCompanyFactory("MEMBER");

    const mainCompany = await companyFactory();

    const initialBsdasri = await bsdasriFactory({
      opt: {
        ...initialData(initialCompany)
      }
    });
    const synthesisBsdasri = await bsdasriFactory({
      opt: {
        type: BsdasriType.SYNTHESIS,
        ...initialData(mainCompany),
        synthesizing: { connect: [{ id: initialBsdasri.id }] }
      }
    });

    expect(synthesisBsdasri.synthesisEmitterSirets).toEqual([
      initialCompany.siret
    ]);
  });
});
