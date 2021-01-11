import React from "react";
import { Formik, Field, Form } from "formik";
import { formatISO } from "date-fns";
import NumberInput from "form/custom-inputs/NumberInput";
import DateInput from "form/custom-inputs/DateInput";
import { SlipActionProps } from "./SlipActions";
import { InlineRadioButton, RadioButton } from "form/custom-inputs/RadioButton";
import {
  WasteAcceptationStatusInput as WasteAcceptationStatus,
  FormStatus,
} from "generated/graphql/types";
import { textConfig } from "./Received";

const FieldError = ({ fieldError }) =>
  !!fieldError ? (
    <p className="text-red tw-mt-0 tw-mb-0">{fieldError}</p>
  ) : null;

export default function Accepted(props: SlipActionProps) {
  return (
    <div>
      <Formik
        initialValues={{
          signedBy: "",
          signedAt: formatISO(new Date(), { representation: "date" }),
          quantityReceived: "",
          wasteAcceptationStatus: "",
          wasteRefusalReason: "",
          ...(props.form.recipient?.isTempStorage &&
            props.form.status === FormStatus.Sent && { quantityType: "REAL" }),
        }}
        onSubmit={values => props.onSubmit({ info: values })}
      >
        {({ values, errors, touched, handleReset, setFieldValue }) => {
          const hasErrors = !!Object.keys(errors).length;
          const isTouched = !!Object.keys(touched).length;

          return (
            <Form>
              <div className="form__row">
                <div className="form__row">
                  <fieldset className="form__radio-group">
                    <h4 className="tw-mr-2">Lot accepté: </h4>
                    <Field
                      name="wasteAcceptationStatus"
                      id={WasteAcceptationStatus.Accepted}
                      label="Oui"
                      component={InlineRadioButton}
                      onChange={() => {
                        // clear wasteRefusalReason if waste is accepted
                        setFieldValue("wasteRefusalReason", "");
                        setFieldValue(
                          "wasteAcceptationStatus",
                          WasteAcceptationStatus.Accepted
                        );
                      }}
                    />
                    <Field
                      name="wasteAcceptationStatus"
                      id={WasteAcceptationStatus.Refused}
                      label="Non"
                      component={InlineRadioButton}
                      onChange={() => {
                        setFieldValue("quantityReceived", 0);
                        setFieldValue(
                          "wasteAcceptationStatus",
                          WasteAcceptationStatus.Refused
                        );
                      }}
                    />
                    <Field
                      name="wasteAcceptationStatus"
                      id={WasteAcceptationStatus.PartiallyRefused}
                      label="Partiellement"
                      component={InlineRadioButton}
                    />
                  </fieldset>
                </div>
              </div>
              <p className="form__row">
                <label>
                  Poids à l'arrivée
                  <Field
                    component={NumberInput}
                    name="quantityReceived"
                    placeholder="En tonnes"
                    className="td-input"
                    disabled={
                      values.wasteAcceptationStatus ===
                      WasteAcceptationStatus.Refused
                    }
                  />
                  <FieldError fieldError={errors.quantityReceived} />
                  <span>
                    Poids indicatif émis: {props.form.stateSummary?.quantity}{" "}
                    tonnes
                  </span>
                </label>
              </p>
              {props.form.recipient?.isTempStorage &&
                props.form.status === FormStatus.Sent && (
                  <fieldset className="form__row">
                    <legend>Cette quantité est</legend>
                    <Field
                      name="quantityType"
                      id="REAL"
                      label="Réelle"
                      component={RadioButton}
                    />
                    <Field
                      name="quantityType"
                      id="ESTIMATED"
                      label="Estimée"
                      component={RadioButton}
                    />
                  </fieldset>
                )}
              {/* Display wasteRefusalReason field if waste is refused or partially refused*/}
              {[
                WasteAcceptationStatus.Refused.toString(),
                WasteAcceptationStatus.PartiallyRefused.toString(),
              ].includes(values.wasteAcceptationStatus) && (
                <p className="form__row">
                  <label>
                    {
                      textConfig[values.wasteAcceptationStatus]
                        .refusalReasonText
                    }
                    <Field name="wasteRefusalReason" className="td-input" />
                    <FieldError fieldError={errors.wasteRefusalReason} />
                  </label>
                </p>
              )}
              <p className="form__row">
                <label>
                  Nom du responsable
                  <Field
                    type="text"
                    name="signedBy"
                    placeholder="NOM Prénom"
                    className="td-input"
                  />
                  <FieldError fieldError={errors.signedBy} />
                </label>
              </p>
              <p className="form__row">
                <label>
                  Date d'acceptation
                  <Field
                    component={DateInput}
                    name="signedAt"
                    className="td-input"
                  />
                  <FieldError fieldError={errors.signedAt} />
                </label>
              </p>
              <p>
                {values.wasteAcceptationStatus &&
                  textConfig[values.wasteAcceptationStatus].validationText}
              </p>
              <div className="form__actions">
                <button
                  type="button"
                  className="btn btn--outline-primary"
                  onClick={() => {
                    handleReset();
                    props.onCancel();
                  }}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className={
                    hasErrors || !isTouched
                      ? "btn btn--primary"
                      : "btn btn--primary"
                  }
                  disabled={hasErrors || !isTouched}
                >
                  Je valide la réception
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}