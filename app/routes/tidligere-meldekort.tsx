import type {MetaFunction} from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/meldekortHeader";

export const meta: MetaFunction = () => {
    return [
        { title: "Meldekort" },
        { name: "description", content: "Tidligere meldekort" },
    ];
};

export default function TidligereMeldekort() {
    return (
      <div>
          <MeldekortHeader />
      </div>
    );
}
