import type { LoaderFunction, MetaFunction } from "react-router";
import { redirect } from "react-router";


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
