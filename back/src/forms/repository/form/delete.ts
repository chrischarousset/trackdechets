import { Form, Prisma } from "@prisma/client";
import { deleteBsd } from "../../../common/elastic";
import {
  LogMetadata,
  RepositoryFnDeps
} from "../../../common/repository/types";
import { GraphQLContext } from "../../../types";
import buildRemoveAppendix2 from "./removeAppendix2";

export type DeleteFormFn = (
  where: Prisma.FormWhereUniqueInput,
  logMetadata?: LogMetadata
) => Promise<Form>;

const buildDeleteForm: (deps: RepositoryFnDeps) => DeleteFormFn =
  deps => async (where, logMetadata) => {
    const { user, prisma } = deps;

    const deletedForm = await prisma.form.update({
      where,
      data: { isDeleted: true }
    });

    if (deletedForm.forwardedInId) {
      await prisma.form.update({
        where,
        data: { forwardedIn: { update: { isDeleted: true } } }
      });
    }

    await prisma.event.create({
      data: {
        streamId: deletedForm.id,
        actor: user.id,
        type: "BsddDeleted",
        data: {},
        metadata: { ...logMetadata, authType: user.auth }
      }
    });

    await deleteBsd({ id: deletedForm.id }, { user } as GraphQLContext);

    // disconnect appendix2 forms if any
    const removeAppendix2 = buildRemoveAppendix2({ prisma, user });
    await removeAppendix2(deletedForm.id);

    return deletedForm;
  };

export default buildDeleteForm;
