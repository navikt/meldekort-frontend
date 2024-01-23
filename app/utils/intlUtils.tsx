import type { ReactElement } from "react";
import i18next from "i18next";

export const getText = (key: string, values?: object): string => {
  let text = ""

  if (i18next.exists(key)) text = i18next.t(key).trim()
  else text = i18next.t(key.split("-")[0]).trim()

  if (values) {
    for (const key in values) {
      text = text.replace("{" + key + "}", (values as any)[key])
    }
  }

  return text
}

export const parseHtml = (text: string, values?: Array<string>): ReactElement => {
  if (values) {
    for (const key in values) {
      text = text.replace("{" + key + "}", values[key])
    }
  }

  return (
    <span dangerouslySetInnerHTML={{ __html: text }} />
  );
}
