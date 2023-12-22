import type { MetaFunction } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Send meldekort" },
  ];
};

export default function SendMeldekort() {
  const innhold = <div></div>

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={"Send meldekort"} innhold={innhold} />
    </div>
  );
}
