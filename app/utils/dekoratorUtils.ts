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
      headNodes.forEach(node => {
        const htmlScriptElement = node as HTMLScriptElement;
        const htmlElement = createHtmlElement("script", htmlScriptElement);
        document.body.appendChild(htmlElement);
      });

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
