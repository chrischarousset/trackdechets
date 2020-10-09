import React from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import { Field, FormikProps } from "formik";
import { FaHourglassHalf } from "react-icons/fa";
import cogoToast from "cogo-toast";
import { COMPANY_INFOS } from "form/company/query";
import RedErrorMessage from "common/components/RedErrorMessage";
import AutoFormattingSiret from "common/components/AutoFormattingSiret";
import { NotificationError } from "common/components/Error";
import styles from "../AccountCompanyAdd.module.scss";

type IProps = Pick<FormikProps<any>, "values"> & {
  onCompanyInfos: (companyInfos) => void;
};

/**
 * SIRET Formik field for company creation
 * The siret is checked against query { companyInfos }
 * to make sure :
 * - company exists
 * - it is not already registered in TD
 * - it is not closed
 */
export default function AccountCompanyAddSiret({
  values,
  onCompanyInfos,
}: IProps) {
  const [searchCompany, { loading, error }] = useLazyQuery(COMPANY_INFOS, {
    onCompleted: data => {
      if (data && data.companyInfos) {
        const companyInfos = data.companyInfos;
        if (companyInfos.isRegistered) {
          cogoToast.error(
            "Ce SIRET existe déjà dans Trackdéchets, impossible de le re-créer."
          );
          onCompanyInfos(null);
        } else if (data.companyInfos.etatAdministratif === "F") {
          cogoToast.error(
            "Cet établissement est fermé, impossible de le créer"
          );
          onCompanyInfos(null);
        } else {
          onCompanyInfos(data.companyInfos);
        }
      }
    },
    onError: () => {
      onCompanyInfos(null);
    },
  });

  return (
    <>
      {error && <NotificationError apolloError={error} />}
      <div className={styles.field}>
        <label className={`text-right ${styles.bold}`}>SIRET</label>
        <div className={styles.field__value}>
          <Field name="siret" component={AutoFormattingSiret} />
          <RedErrorMessage name="siret" />
          <br />
          <button
            className="btn btn--primary tw-mt-2"
            type="button"
            onClick={() => {
              const trimedSiret = values.siret.replace(/\s/g, "");
              if (trimedSiret.length !== 14) {
                return;
              }
              searchCompany({ variables: { siret: trimedSiret } });
            }}
          >
            {loading ? <FaHourglassHalf /> : "Valider"}
          </button>
        </div>
      </div>
    </>
  );
}
