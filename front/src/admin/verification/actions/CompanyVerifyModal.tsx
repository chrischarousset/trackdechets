import cogoToast from "cogo-toast";
import TdModal from "common/components/Modal";
import { Formik, Form, Field } from "formik";
import { gql, useMutation } from "@apollo/client";
import React from "react";
import styles from "./CompanyVerifyModal.module.scss";
import {
  CompanyForVerification,
  Mutation,
  MutationVerifyCompanyByAdminArgs,
} from "generated/graphql/types";
import { NotificationError } from "common/components/Error";
import { isSiret } from "generated/constants/companySearchHelpers";

type VerifyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyForVerification;
};

type Values = {
  verificationComment: string;
};

const VERIFY_COMPANY_BY_ADMIN = gql`
  mutation VerifyCompanyByAdmin($input: VerifyCompanyByAdminInput!) {
    verifyCompanyByAdmin(input: $input) {
      id
      verificationStatus
      verificationComment
      verificationMode
    }
  }
`;

export default function CompanyVerifyModal({
  isOpen,
  onClose,
  company,
}: VerifyModalProps) {
  const [verifyCompanyByAdmin, { error, loading }] = useMutation<
    Pick<Mutation, "verifyCompanyByAdmin">,
    MutationVerifyCompanyByAdminArgs
  >(VERIFY_COMPANY_BY_ADMIN, {
    onCompleted: () => {
      cogoToast.success("Verification envoyée", { hideAfter: 5 });
      return onClose();
    },
    onError: () => {
      cogoToast.error("La vérification n'a pas pu être envoyée", {
        hideAfter: 5,
      });
    },
  });

  function onSubmit(values: Values) {
    if (isSiret(company.siret!)) {
      return verifyCompanyByAdmin({
        variables: {
          input: {
            siret: company.siret!,
            verificationComment: values.verificationComment,
          },
        },
      });
    } else {
      cogoToast.error(
        "La vérification n'a pas pu être envoyée, l'établissement ne possède pas de SIRET valide",
        {
          hideAfter: 5,
        }
      );
    }
  }

  return (
    <TdModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      ariaLabel="Vérifier l'établissment"
    >
      <div className={styles.VerifyModal}>
        <h2 className="td-modal-title">Vérifier l'établissment</h2>
        <Formik<Values>
          initialValues={{ verificationComment: "" }}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <>
                <Field
                  name="verificationComment"
                  as="textarea"
                  placeholder="Commentaire (optionnel)"
                ></Field>
                <div className="tw-mt-5">
                  Vous êtes sur le point de vérifier cet établissement
                  manuellement
                </div>
                <div className="td-modal-actions">
                  <button
                    className="btn btn--outline-primary"
                    onClick={() => onClose()}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={isSubmitting}
                  >
                    <span>{loading ? "Envoi en cours..." : "Valider"}</span>
                  </button>
                </div>
                {error && <NotificationError apolloError={error} />}
              </>
            </Form>
          )}
        </Formik>
      </div>
    </TdModal>
  );
}
