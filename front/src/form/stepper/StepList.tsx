import { useMutation, useQuery } from "@apollo/client";
import cogoToast from "cogo-toast";
import { Formik, setNestedObjectValues } from "formik";
import React, {
  Children,
  createElement,
  ReactElement,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { useHistory, useParams, generatePath } from "react-router-dom";

import { Breadcrumb, BreadcrumbItem } from "common/components";
import { InlineError } from "common/components/Error";
import { updateApolloCache } from "common/helper";
import { DRAFT_TAB_FORMS } from "dashboard/slips/tabs/queries";
import initialState, {
  initalTemporaryStorageDetail,
  initialTrader,
  initialEcoOrganisme,
  initialWorkSite,
} from "../initial-state";
import {
  Form,
  Query,
  QueryFormArgs,
  Mutation,
  FormInput,
  MutationUpdateFormArgs,
  MutationCreateFormArgs,
} from "generated/graphql/types";
import { formSchema } from "../schema";
import { CREATE_FORM, GET_FORM, UPDATE_FORM } from "./queries";
import { IStepContainerProps, Step } from "./Step";
import routes from "common/routes";
import "./StepList.scss";

interface IProps {
  children: ReactElement<IStepContainerProps>[];
  formId?: string;
}
export default function StepList(props: IProps) {
  const { siret } = useParams<{ siret: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = props.children.length - 1;
  const history = useHistory();

  const { loading, error, data } = useQuery<Pick<Query, "form">, QueryFormArgs>(
    GET_FORM,
    {
      variables: {
        id: props.formId!,
        readableId: null,
      },
      skip: !props.formId,
      fetchPolicy: "network-only",
    }
  );

  const formState = useMemo(() => {
    if (!data?.form) {
      return initialState;
    } else {
      const {
        temporaryStorageDetail,
        ecoOrganisme,
        trader,
        ...form
      } = data.form;
      const state = {
        ...getComputedState(initialState, form),
        temporaryStorageDetail: temporaryStorageDetail
          ? getComputedState(
              initalTemporaryStorageDetail,
              temporaryStorageDetail
            )
          : null,
        trader: trader ? getComputedState(initialTrader, trader) : null,
        ecoOrganisme: ecoOrganisme
          ? getComputedState(initialEcoOrganisme, ecoOrganisme)
          : null,
      };
      if (form.emitter?.workSite) {
        state.emitter.workSite = getComputedState(
          initialWorkSite,
          form.emitter.workSite
        );
      }

      return state;
    }
  }, [data]);

  const [createForm] = useMutation<
    Pick<Mutation, "createForm">,
    MutationCreateFormArgs
  >(CREATE_FORM, {
    update: (store, { data }) => {
      if (!data?.createForm) {
        return;
      }
      const createdForm = data.createForm;
      updateApolloCache<{ forms: Form[] }>(store, {
        query: DRAFT_TAB_FORMS,
        variables: { siret },
        getNewData: data => ({
          forms: [
            createdForm,
            ...data.forms.filter(f => f.id !== createdForm.id),
          ],
        }),
      });
    },
  });

  const [updateForm] = useMutation<
    Pick<Mutation, "updateForm">,
    MutationUpdateFormArgs
  >(UPDATE_FORM);

  function saveForm(formInput: FormInput): Promise<any> {
    return formState.id
      ? updateForm({
          variables: { updateFormInput: { ...formInput, id: formState.id } },
        })
      : createForm({ variables: { createFormInput: formInput } });
  }

  useEffect(() => window.scrollTo(0, 0), [currentStep]);

  // When we edit a draft we want to automatically display on error on init
  const formikForm: any = useRef();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formikForm.current) {
        const { touched, values, setTouched } = formikForm.current;
        if (Object.keys(touched).length === 0 && values.id != null) {
          setTouched(setNestedObjectValues(values, true));
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  });

  const children = Children.map(props.children, (child, index) => {
    return createElement(
      Step,
      {
        isActive: index === currentStep,
        displayPrevious: currentStep > 0,
        displayNext: currentStep < totalSteps,
        displaySubmit: currentStep === totalSteps,
        goToPreviousStep: () => setCurrentStep(currentStep - 1),
        goToNextStep: () => setCurrentStep(currentStep + 1),
        formId: props.formId,
      },
      child
    );
  });

  if (loading) return <p>Chargement...</p>;
  if (error) return <InlineError apolloError={error} />;

  const redirectTo =
    data?.form?.status === "SEALED"
      ? generatePath(routes.dashboard.slips.follow, { siret })
      : generatePath(routes.dashboard.slips.drafts, { siret });

  return (
    <div>
      <Breadcrumb>
        {Children.map(props.children, (child, index) => (
          <BreadcrumbItem
            variant={
              index === currentStep
                ? "active"
                : currentStep > index
                ? "complete"
                : "normal"
            }
            onClick={() => setCurrentStep(index)}
          >
            <span>{child.props.title}</span>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
      <div className="step-content">
        <Formik<FormInput>
          innerRef={formikForm}
          initialValues={formState}
          validationSchema={formSchema}
          onSubmit={() => Promise.resolve()}
        >
          {({ values }) => {
            return (
              <form
                onSubmit={e => {
                  const {
                    temporaryStorageDetail,
                    ecoOrganisme,
                    ...rest
                  } = values;

                  const formInput = {
                    ...rest,
                    // discard temporaryStorageDetail if recipient.isTempStorage === false
                    ...(values.recipient?.isTempStorage === true
                      ? { temporaryStorageDetail }
                      : { temporaryStorageDetail: null }),
                    // discard ecoOrganisme if not selected
                    ...(ecoOrganisme?.siret
                      ? { ecoOrganisme }
                      : { ecoOrganisme: null }),
                  };

                  e.preventDefault();
                  // As we want to be able to save draft, we skip validation on submit
                  // and don't use the classic Formik mechanism

                  saveForm(formInput)
                    .then(_ => history.push(redirectTo))
                    .catch(err => {
                      err.graphQLErrors.map(err =>
                        cogoToast.error(err.message, { hideAfter: 7 })
                      );
                    });
                  return false;
                }}
              >
                <div
                  onKeyPress={e => {
                    // Disable submit on Enter key press
                    // We prevent it from bubbling further
                    if (e.key === "Enter") {
                      e.stopPropagation();
                    }
                  }}
                >
                  {children}
                </div>
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

/**
 * Construct the form state by merging initialState and the actual form.
 * The actual form may include properties that do not belong to the form.
 * If we keep them in the form state they will break the mutation validation.
 * To avoid that, we make sure that every properties we keep is a property contained in initial state.
 *
 * @param initialState what an empty Form is
 * @param actualForm the actual form
 */
export function getComputedState(initialState, actualForm) {
  if (!actualForm) {
    return initialState;
  }

  const startingObject = actualForm.id ? { id: actualForm.id } : {};

  return Object.keys(initialState).reduce((prev, curKey) => {
    const initialValue = initialState[curKey];
    if (
      typeof initialValue === "object" &&
      initialValue !== null &&
      !(initialValue instanceof Array)
    ) {
      prev[curKey] = getComputedState(initialValue, actualForm[curKey]);
    } else {
      prev[curKey] = actualForm[curKey] ?? initialValue;
    }

    return prev;
  }, startingObject);
}
