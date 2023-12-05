import type {MetaFunction} from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/meldekortHeader";

export const meta: MetaFunction = () => {
    return [
        { title: "Meldekort" },
        { name: "description", content: "Etterregistrering" },
    ];
};

export default function Etterregistrering() {
    return (
      <div>
          <MeldekortHeader />
      </div>
    );
}
