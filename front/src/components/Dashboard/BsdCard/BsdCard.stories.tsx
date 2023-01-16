import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Bsda, Bsdasri, Bsff, Bsvhu, Form } from "generated/graphql/types";

import BsdCard from "./BsdCard";
import bsddListDraft from "../../../__mocks__/bsdListDraft.json";
import bsdListActJson from "../../../__mocks__/bsdListAct.json";

export default {
  title: "COMPONENTS/DASHBOARD/BsdCard",
  component: BsdCard,
  design: {
    type: "figma",
    url: "https://www.figma.com/file/tyefue5qFChEpujrFU1Jiz/Librairie-TD-dashboard?node-id=1%3A2420&t=0tYb1cF2o4m4Id2g-4",
  },
} as ComponentMeta<typeof BsdCard>;

const Template: ComponentStory<typeof BsdCard> = args => <BsdCard {...args} />;

export const BsddDraftAvecInfosDechet = Template.bind({});
export const BsddDraftSansInfosDechet = Template.bind({});
export const BsvhuDraft = Template.bind({});
export const BsddAvecIconeEntreposage = Template.bind({});
export const BsdaAvecAction = Template.bind({});
export const BsffAvecAction = Template.bind({});
export const BsdasriAvecActionEtIconeDateDeDerniereModification = Template.bind(
  {}
);
const currentSiret = "53230142100022";
const onValidate = jest.fn();
BsddDraftAvecInfosDechet.args = {
  bsd: bsddListDraft[10].node as unknown as Form,
  currentSiret,
  onValidate,
};
BsddDraftSansInfosDechet.args = {
  bsd: bsddListDraft[3].node as unknown as Form,
  currentSiret,
  onValidate,
};
BsddAvecIconeEntreposage.args = {
  bsd: bsddListDraft[1].node as unknown as Form,
  currentSiret,
  onValidate,
};
BsvhuDraft.args = {
  bsd: bsddListDraft[9].node as unknown as Bsvhu,
  currentSiret,
  onValidate,
};
BsdaAvecAction.args = {
  bsd: bsdListActJson[0].node as unknown as Bsda,
  currentSiret,
  onValidate,
};

BsffAvecAction.args = {
  bsd: bsdListActJson[3].node as unknown as Bsff,
  currentSiret,
  onValidate,
};
BsdasriAvecActionEtIconeDateDeDerniereModification.args = {
  bsd: bsdListActJson[4].node as unknown as Bsdasri,
  currentSiret,
  onValidate,
};
