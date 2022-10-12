import { Event } from "@prisma/client";
import { insertStreamEvents } from "../../src/common/events/mongodb";
import prisma from "../../src/prisma";
import { registerUpdater, Updater } from "./helper/helper";

const BATCH_SIZE = 1000;

@registerUpdater("Migrate events", `Migrate Psql events to Mongo`, true)
export class SetContactsUpdater implements Updater {
  async run() {
    console.info("Starting script to migrate psql events...");

    try {
      let counter = 0;
      const totalNumberOfEvents = await prisma.event.count();
      console.info(`🧮 There are ${totalNumberOfEvents} events to migrate`);
      console.info(`ℹ️ Batch size is ${BATCH_SIZE}\n`);

      while (true) {
        const nbOfEventsProcessed = await prisma.$transaction(
          async transaction => {
            const events = await transaction.event.findMany({
              take: BATCH_SIZE
            });

            if (events.length === 0) return 0;

            await insertStreamEvents(events);

            await transaction.event.deleteMany({
              where: { id: { in: events.map(e => e.id) } }
            });

            return events.length;
          }
        );

        counter++;
        printProgress(counter, totalNumberOfEvents);

        if (nbOfEventsProcessed < BATCH_SIZE) break;
      }
    } catch (err) {
      console.error("☠ Something went wrong during the update", err);
      throw new Error();
    }
  }
}

function groupByStreamId(array: Event[]) {
  return array.reduce<Record<string, Event[]>>((groups, event) => {
    const { streamId } = event;
    if (!groups[streamId]) {
      groups[streamId] = [];
    }

    groups[streamId].push(event);
    return groups;
  }, {});
}

function printProgress(batchNb: number, totalNumberOfEvents: number) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  const progress = Math.round(
    ((batchNb * BATCH_SIZE) / totalNumberOfEvents) * 100
  );
  process.stdout.write(`Batch number: ${batchNb} - ${progress}% done.`);
}
