FROM quay.io/keycloak/keycloak:25.0

ARG KEYCLOAK_ADMIN
ARG KEYCLOAK_ADMIN_PASSWORD
ENV KEYCLOAK_ADMIN=${KEYCLOAK_ADMIN:-admin}
ENV KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD:-admin}

COPY realm-export.json /opt/keycloak/data/import/
ENTRYPOINT []
CMD ["/opt/keycloak/bin/kc.sh", "start-dev", "--proxy-headers=xforwarded", "--hostname-strict=false", "--import-realm"]
