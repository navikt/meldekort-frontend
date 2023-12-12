import type { ReactElement } from "react";

export const formatHtmlMessage = (text: string, values?: Array<string>): ReactElement => {
  if (values) {
    for (const key in values) {
      text = text.replace("{" + key + "}", values[key])
    }
  }

  return (
    <span dangerouslySetInnerHTML={{ __html: text }} />
  );
}
