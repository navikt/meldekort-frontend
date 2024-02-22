/*
 * Injiser script-elementet til dekoratøren og en tilhørende div.
 * useEffect()-hooken sørger for at dette gjøres utelukkende client-side, ellers vil dekoratøren manipulere DOM-en og forstyrre hydreringen.
 */
import { useEffect, useRef } from "react";

export const useInjectDecoratorScript = (script?: string) => {
  const isInjected = useRef(false);

  useEffect(() => {
    if (script && !isInjected.current) {
      const parser = new DOMParser();
      const parsedDocument = parser.parseFromString(script, "text/html");

      const parsedElements = Array.from(parsedDocument.body.childNodes);
      const parsedDivElement = parsedElements[0] as HTMLDivElement;
      const parsedScriptElement = parsedElements[2] as HTMLScriptElement;

      const divElement = createElementWithAttributes("div", parsedDivElement.attributes);
      const scriptElement = createElementWithAttributes(
        "script",
        parsedScriptElement.attributes
      );

      document.body.appendChild(divElement);
      document.body.appendChild(scriptElement);

      isInjected.current = true;
    }
  }, [script]);
};

const createElementWithAttributes = (tag: string, attributes: NamedNodeMap) => {
  const element = document.createElement(tag);

  for (let i = 0; i < attributes.length; i++) {
    element.setAttribute(attributes[i].name, attributes[i].value);
  }

  return element;
};
