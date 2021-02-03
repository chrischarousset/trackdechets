import { gql, useMutation } from "@apollo/client";
import React from "react";
import { statusChangeFragment } from "common/fragments";
import { ActionButton } from "common/components";
import { IconPaperWrite } from "common/components/Icons";
import {
  FormStatus,
  Mutation,
  MutationMarkAsSealedArgs,
  Query,
} from "generated/graphql/types";
import { updateApolloCache } from "common/helper";
import { DRAFT_TAB_FORMS, FOLLOW_TAB_FORMS } from "../../tabs/queries";
import { WorkflowActionProps } from "./WorkflowAction";
import { NotificationError } from "common/components/Error";
import { TdModalTrigger } from "common/components/Modal";
import cogoToast from "cogo-toast";

const MARK_AS_SEALED = gql`
  mutation MarkAsSealed($id: ID!) {
    markAsSealed(id: $id) {
      readableId
      ...StatusChange
    }
  }
  ${statusChangeFragment}
`;

export default function MarkAsSealed({ form, siret }: WorkflowActionProps) {
  const [markAsSealed, { error }] = useMutation<
    Pick<Mutation, "markAsSealed">,
    MutationMarkAsSealedArgs
  >(MARK_AS_SEALED, {
    variables: { id: form.id },
    update: (cache, { data }) => {
      if (!data?.markAsSealed) {
        return;
      }
      const sealedForm = data.markAsSealed;
      // remove form from the draft tab
      updateApolloCache<Pick<Query, "forms">>(cache, {
        query: DRAFT_TAB_FORMS,
        variables: { siret },
        getNewData: data => ({
          forms: [...data.forms].filter(form => form.id !== sealedForm.id),
        }),
      });
      // add the form to the follow tab
      updateApolloCache<Pick<Query, "forms">>(cache, {
        query: FOLLOW_TAB_FORMS,
        variables: { siret },
        getNewData: data => ({
          forms: [sealedForm, ...data.forms],
        }),
      });
    },
    onCompleted: data => {
      if (data.markAsSealed) {
        const sealedForm = data.markAsSealed;
        if (sealedForm.status === FormStatus.Sealed)
          cogoToast.success(
            `Le numéro #${sealedForm.readableId} a été affecté au bordereau. Vous pouvez le retrouver dans l'onglet "Suivi"`
          );
      }
    },
  });

  const actionLabel = "Valider le bordereau";

  return (
    <TdModalTrigger
      ariaLabel={actionLabel}
      trigger={open => (
        <div>
          <ActionButton
            title={actionLabel}
            icon={IconPaperWrite}
            onClick={open}
          />
        </div>
      )}
      modalContent={close => (
        <div>
          <div>
            <p>
              Cette action aura pour effet de valider les données du bordereau
              et de le faire apparaitre dans l'onglet "À collecter" du tableau
              de bord transporteur. Un identifiant unique lui sera attribué et
              vous pourrez générer un PDF. Le bordereau pourra cependant
              toujours être modifié ou supprimé depuis l'onglet "Suivi".
            </p>

            <div className="td-modal-actions">
              <button
                type="button"
                className="btn btn--outline-primary"
                onClick={close}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                onClick={() => markAsSealed()}
              >
                Je valide
              </button>
            </div>
          </div>

          {error && (
            <NotificationError className="action-error" apolloError={error} />
          )}
        </div>
      )}
    />
  );
}
