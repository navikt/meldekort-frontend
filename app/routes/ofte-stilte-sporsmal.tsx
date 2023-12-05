import type {MetaFunction} from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/meldekortHeader";

export const meta: MetaFunction = () => {
    return [
        { title: "Meldekort" },
        { name: "description", content: "Ofte stilte spørsmål" },
    ];
};

export default function OfteStilteSporsmal() {
    return (
      <div>
          <MeldekortHeader />
      </div>
    );
}
