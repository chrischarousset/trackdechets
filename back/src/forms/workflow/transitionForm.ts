import {
  Form,
  FormUpdateInput,
  Status,
  prisma,
  User
} from "../../generated/prisma-client";
import { Event } from "./types";
import machine from "./machine";
import { InvalidTransition } from "../errors";

export default async function transitionForm(
  user: User,
  form: Form,
  event: Event
) {
  const currentStatus = form.status;

  // Use state machine to calculate new status
  const nextState = machine.transition(currentStatus, event);

  // This transition is not possible
  if (!nextState.changed) {
    throw new InvalidTransition();
  }

  const nextStatus = nextState.value as Status;

  const formUpdateInput: FormUpdateInput = {
    status: nextStatus,
    ...event.formUpdateInput
  };

  // update form
  const updatedForm = await prisma.updateForm({
    where: { id: form.id },
    data: formUpdateInput
  });

  // log status change
  await prisma.createStatusLog({
    user: { connect: { id: user.id } },
    form: { connect: { id: form.id } },
    status: nextStatus,
    loggedAt: new Date(),
    updatedFields: event.formUpdateInput ?? {}
  });

  return updatedForm;
}
