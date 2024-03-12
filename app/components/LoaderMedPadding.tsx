import { Box, Loader } from "@navikt/ds-react";


export default function LoaderMedPadding() {
  return (
    <div>
      <Box padding="32" />
      <Loader size="3xlarge" className="img" title="Venter..." />
      <Box padding="32" />
    </div>
  );
}
