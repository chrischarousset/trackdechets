import prisma from "../../src/prisma";
import { registerUpdater, Updater } from "./helper/helper";

@registerUpdater(
  "Delete stale activation hashes",
  "Delete stale activation hashes",
  true
)
export class DeleteStaleActivationHAshes implements Updater {
  async run() {
    // delete hash entries where user is already activated
    await prisma.userActivationHash.deleteMany({
      where: {
        user: { isActive: true }
      }
    });
  }
}