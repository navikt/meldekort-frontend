import { Box, Loader } from "@navikt/ds-react";


export default function LoaderMedPadding() {
  return (
    <div>
      <Box padding="space-128" />
      <Loader size="3xlarge" className="img" title="Venter..." />
      <Box padding="space-128" />
    </div>
  );
}
