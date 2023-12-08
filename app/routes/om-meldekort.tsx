import type { MetaFunction } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Om meldekort" },
  ];
};

export default function OmMeldekort() {
  return (
    <div>
      <MeldekortHeader />
    </div>
  );
}
