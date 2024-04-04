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

      const headNodes = Array.from(parsedDocument.head.childNodes);

      if (headNodes.length !== 0) {
        // New
        headNodes.forEach(node => {
          const htmlScriptElement = node as HTMLScriptElement;
          const htmlElement = createHtmlElement("script", htmlScriptElement);
          document.body.appendChild(htmlElement);
        });
      } else {
        // Old
        const parsedElements = Array.from(parsedDocument.body.childNodes);
        const parsedDivElement = parsedElements[0] as HTMLDivElement;
        const parsedScriptElement = parsedElements[2] as HTMLScriptElement;
        console.log(parsedScriptElement)

        const divElement = createHtmlElement("div", parsedDivElement);
        const scriptElement = createHtmlElement("script", parsedScriptElement);

        document.body.appendChild(divElement);
        document.body.appendChild(scriptElement);
      }

      isInjected.current = true;
    }
  }, [script]);
};

const createHtmlElement = (tag: string, htmlScriptElement: HTMLElement) => {
  const element = document.createElement(tag);

  const attributes = htmlScriptElement.attributes;
  const innerText = htmlScriptElement.innerText;

  for (let i = 0; i < htmlScriptElement.attributes.length; i++) {
    element.setAttribute(attributes[i].name, attributes[i].value);
  }

  element.innerText = innerText;

  return element;
};
