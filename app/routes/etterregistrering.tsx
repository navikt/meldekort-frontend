import type { MetaFunction } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Etterregistrering" },
  ];
};

export default function Etterregistrering() {
  const innhold = <div></div>

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={"Etterregistrering"} innhold={innhold} />
    </div>
  );
}
