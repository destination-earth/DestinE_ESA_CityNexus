# Keycloak Development Instance

This keycloak instance is configured to automatically import the realm configuration `realm-export.json`.

**NOTE:** No data is persisted between recreations of the container.

## Getting Started

1. Copy `.env.dist` to `.env` and configure environment variables as you need (default settings can be used for development).
2. Run `docker compose up -d --build`

Users available by default:

| User     | Password |
|----------|----------|
| foo      | foo      |
| bar      | bar      |

## Updating Realm Configuration

To export an updated configuration:

1. Run the container without starting keycloak by setting the command for the keycloak image in the `docker-compose.yml`
   to something like `tail -F /dev/null`
2. Add a volume mapping to a host directory for the exported config. Something
   like: `./export:/opt/keycloak/data/export`
3. Make sure the `./export` directory is writable for the container user (e.g. `chmod -R 777 ./export`)
4. Exec into the container: `docker compose exec keycloak bash`
5. Change into the keycloak directory: `cd /opt/keycloak`
6. Import the existing realm
   configuration: `bin/kc.sh import --file /opt/keycloak/data/import/realm-export.json --override true`
7. Start keycloak: `bin/kc.sh start-dev`
8. Make the necessary changes via the Keycloak interface
9. Export the realm to file: `bin/kc.sh export --file /opt/keycloak/data/export/realm-export.json --realm desp`
10. Copy the exported configuration over the existing configuration or adapt as needed.
