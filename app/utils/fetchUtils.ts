export function getHeaders(onBehalfOfToken: string) {
  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "TokenXAuthorization": `Bearer ${onBehalfOfToken}`,
  };
}
