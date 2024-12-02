import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getEnv } from "~/utils/envUtils";


export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Meldekort" },
  ];
};

export const loader: LoaderFunction = async () => {
  return redirect(`/send-meldekort`, 301);
};

export default function Index() {
  return (<div></div>);
}
