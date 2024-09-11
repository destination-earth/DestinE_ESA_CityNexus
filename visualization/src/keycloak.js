import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://iam.e2e.desp.space",
  realm: "desp",
  clientId: "citynexus",
});

export default keycloak;
