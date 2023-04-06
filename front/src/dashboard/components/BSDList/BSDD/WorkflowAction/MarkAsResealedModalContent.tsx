import { gql, useMutation } from "@apollo/client";
import { Loader, RedErrorMessage } from "common/components";
import { NotificationError } from "common/components/Error";
import ProcessingOperationSelect from "common/components/ProcessingOperationSelect";
import { statusChangeFragment } from "common/fragments";
import { mergeDefaults } from "common/helper";
import { GET_BSDS } from "common/queries";
import Packagings from "form/bsdd/components/packagings/Packagings";
import Transporter from "form/bsdd/Transporter";
import CompanySelector from "form/common/components/company/CompanySelector";
import NumberInput from "form/common/components/custom-inputs/NumberInput";
import { RadioButton } from "form/common/components/custom-inputs/RadioButton";
import { Field, Form, Formik } from "formik";
import { packagingsEqual } from "generated/constants/formHelpers";
import {
  FormStatus,
  Mutation,
  QuantityType,
  ResealedFormInput,
} from "generated/graphql/types";
import React, { useState } from "react";

const MARK_RESEALED = gql`
  mutation MarkAsResealed($id: ID!, $resealedInfos: ResealedFormInput!) {
    markAsResealed(id: $id, resealedInfos: $resealedInfos) {
      ...StatusChange
    }
  }
  ${statusChangeFragment}
`;
const emptyState = {
  destination: {
    company: {
      siret: "",
      name: "",
      address: "",
      contact: "",
      mail: "",
      phone: "",
    },
    cap: "",
    processingOperation: "",
    isFilledByEmitter: false,
  },
  transporter: {
    isExemptedOfReceipt: false,
    receipt: "",
    department: "",
    validityLimit: null,
    numberPlate: "",
    company: {
      siret: "",
      vatNumber: "",
      name: "",
      address: "",
      contact: "",
      mail: "",
      phone: "",
    },
  },
  wasteDetails: {
    onuCode: "",
    packagingInfos: [],
    quantity: null,
    quantityType: QuantityType.Estimated,
  },
};

const MarkAsResealedModalContent = ({ bsd, onClose }) => {
  const initialValues = mergeDefaults(
    emptyState,
    bsd.temporaryStorageDetail || {}
  );

  const [isRefurbished, setIsRefurbished] = useState(
    !!bsd.temporaryStorageDetail?.wasteDetails?.packagingInfos &&
      !packagingsEqual(
        bsd.temporaryStorageDetail?.wasteDetails?.packagingInfos,
        bsd.wasteDetails?.packagingInfos
      )
  );

  function onChangeRefurbished() {
    const willBeRefurbished = !isRefurbished;
    setIsRefurbished(willBeRefurbished);
  }

  const [markAsResealed, { error, loading }] = useMutation<
    Pick<Mutation, "markAsResealed">
  >(MARK_RESEALED, {
    refetchQueries: [GET_BSDS],
    awaitRefetchQueries: true,
    onError: () => {
      // The error is handled in the UI
    },
  });
  return (
    <div>
      <Formik<ResealedFormInput>
        initialValues={initialValues}
        onSubmit={({ wasteDetails, ...values }) =>
          markAsResealed({
            variables: {
              id: bsd.id,
              resealedInfos: {
                ...values,
                ...(isRefurbished ? { wasteDetails } : {}),
              },
            },
          })
        }
      >
        {() => (
          <Form>
            {bsd.status !== FormStatus.TempStorerAccepted && (
              <div className="notification notification--warning">
                Attention, vous vous apprêtez à ajouter une étape d'entreposage
                provisoire ou de reconditionnement sur un BSDD pour lequel cette
                étape n'était pas prévue initialement.
              </div>
            )}
            <h5 className="form__section-heading">
              Installation de destination prévue
            </h5>

            <CompanySelector name="destination.company" />

            <div className="form__row">
              <label>
                Numéro de CAP (le cas échéant)
                <Field
                  type="text"
                  name="destination.cap"
                  className="td-input"
                />
              </label>
            </div>

            <div className="form__row">
              <Field
                component={ProcessingOperationSelect}
                name="destination.processingOperation"
              />
            </div>

            <div className="form__row form__row--inline">
              <input
                type="checkbox"
                checked={isRefurbished}
                id="id_isRefurbished"
                className="td-checkbox"
                onChange={onChangeRefurbished}
              />
              <label htmlFor="id_isRefurbished">
                Les déchets ont subi un reconditionnement, je dois saisir les
                détails
              </label>
            </div>

            {isRefurbished && (
              <>
                <h5 className="form__section-heading">Détails du déchet</h5>

                <h4>Conditionnement</h4>

                <Field
                  name="wasteDetails.packagingInfos"
                  component={Packagings}
                />

                <h4>Quantité en tonnes</h4>
                <div className="form__row">
                  <Field
                    component={NumberInput}
                    name="wasteDetails.quantity"
                    className="td-input"
                    placeholder="En tonnes"
                    min="0"
                    step="0.001"
                  />

                  <RedErrorMessage name="wasteDetails.quantity" />

                  <fieldset>
                    <legend>Cette quantité est</legend>
                    <Field
                      name="wasteDetails.quantityType"
                      id="REAL"
                      label="Réelle"
                      component={RadioButton}
                    />
                    <Field
                      name="wasteDetails.quantityType"
                      id="ESTIMATED"
                      label="Estimée"
                      component={RadioButton}
                    />
                  </fieldset>

                  <RedErrorMessage name="wasteDetails.quantityType" />
                </div>
                <div className="form__row">
                  <label>
                    Mentions au titre des règlements ADR, RID, ADNR, IMDG (le
                    cas échéant)
                    <Field
                      type="text"
                      name="wasteDetails.onuCode"
                      className="td-input"
                    />
                  </label>
                </div>
              </>
            )}

            <h5 className="form__section-heading">
              Collecteur-transporteur après entreposage ou reconditionnement
            </h5>

            <Transporter />

            <div className="form__actions">
              <button
                type="button"
                className="btn btn--outline-primary"
                onClick={onClose}
              >
                Annuler
              </button>
              <button type="submit" className="btn btn--primary">
                Je valide
              </button>
            </div>
          </Form>
        )}
      </Formik>
      {error && (
        <NotificationError className="action-error" apolloError={error} />
      )}
      {loading && <Loader />}
    </div>
  );
};
export default React.memo(MarkAsResealedModalContent);