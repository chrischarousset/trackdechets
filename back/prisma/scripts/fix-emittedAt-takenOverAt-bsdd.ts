import { updateBsddTakenOverAt } from "../../src/scripts/prisma/updateBsddTakenOverAt";
import { registerUpdater, Updater } from "./helper/helper";

@registerUpdater(
  "Set takenOverAt = emittedAt for all BSDDs where emittedAt > takenOverAt",
  "Set takenOverAt = emittedAt for all BSDDs where emittedAt > takenOverAt",
  true
)
export class UpdateBSDDTakenOverAt implements Updater {
  async run() {
    const nbr: number = await updateBsddTakenOverAt({
      gt: new Date("2023-01-09"), // release 2023.1.1 du 10/01/23 introduction du bug tra-10777
      lt: new Date("2023-01-24") // hotfix du 25/01/23
    });

    console.info(`${nbr} BSDDs updated`);
  }
}
