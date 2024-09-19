# CityNexus Backend API project
## Installation
### Create virtual environment (optional)
```
poetry env use python3.11
poetry shell
```

### Install from `pyproject.toml`
`poetry install`

## Run tests
 - `poetry run pytest`

## Run dev tools
Some linters and formatters are included and can be used as follows:
 - black: `poetry run black .`
 - isort: `poetry run isort .`
 
## Serve Mobility Model API (hot code reloading)
 - `poetry run uvicorn citynexus_api.api.app:app --reload`

## Run API with HTTPS support

Running the API with HTTPS support is done automatically via nginx proxy on the visualization machine.

```
/etc/nginx/conf.d # cat citynexus.conf
server {
    listen 80;
    server_name citynexus.solenix.ch;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
server {
    listen 443 ssl;
    server_name citynexux.solenix.ch;

    ssl_certificate /etc/letsencrypt/live/citynexus.solenix.ch-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/citynexus.solenix.ch-0001/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location /api/v1/citynexus {
        proxy_pass http://141.95.100.171:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # SSL specific settings
        proxy_ssl_session_reuse off;
        proxy_ssl_verify off;
    }

    location /api/v1/mobility-model {
        proxy_pass http://141.95.100.171:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # SSL specific settings
        proxy_ssl_session_reuse off;
        proxy_ssl_verify off;
    }

    location /realms {
        proxy_pass http://141.95.100.171:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # SSL specific settings
        proxy_ssl_session_reuse off;
        proxy_ssl_verify off;
    }

    location / {
        proxy_pass http://localhost:8080;
    }
}
```