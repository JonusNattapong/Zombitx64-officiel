import AccordionNamespace from "./accordion/index";

export const Accordion = Object.assign(AccordionNamespace.Root, {
  Item: AccordionNamespace.Item,
  Trigger: AccordionNamespace.Trigger,
  Content: AccordionNamespace.Content,
});

export type {
  Root as AccordionRoot,
  Item as AccordionItem,
  Trigger as AccordionTrigger,
  Content as AccordionContent,
} from "./accordion/index";
