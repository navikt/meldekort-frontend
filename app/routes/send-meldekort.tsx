import type {MetaFunction} from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/meldekortHeader";

export const meta: MetaFunction = () => {
    return [
        { title: "Meldekort" },
        { name: "description", content: "Send meldekort" },
    ];
};

export default function SendMeldekort() {
    return (
        <div>
            <MeldekortHeader />
        </div>
    );
}
