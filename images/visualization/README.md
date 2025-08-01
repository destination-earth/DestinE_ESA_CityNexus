# Kepler.gl Webapp

This is the src code of kepler.gl demo app. You can copy this folder out and run it locally.

## Local Development

### 1. Setup (only once)

```sh
nvm install
corepack enable
yarn install
```

Apply the CORS configuration in ovh-cors-configuration.json:
1. Setup your AWS credentials as explained here: https://support.us.ovhcloud.com/hc/en-us/articles/4603838122643-Getting-Started-with-S3-Object-Storage
2. Apply the CORS configuration to the twincity-data bucket with:
aws s3api put-bucket-cors --bucket twincity-data --cors-configuration file://ovh-cors-configuration.json

### 2. Start the app

```sh
npm start
```

App will be running at http://localhost:8080

### 3. (Optional) Setting environment variables

Copy `.env_vars.example` to `.env_vars` and replace:
```
NEW_ENV_VARIABLE="new value"
# also supports expandable variables
NEW_ENV_VARIABLE=${HOST_ENV_VARIABLE}
```

The values can be accessed from within the code by using `process.env.NEW_ENV_VARIABLE`.

## Production Build

Building the sourcecode can be done with the following NPM script:

```bash
npm run build
```

You will get bundled html/js files in the `build` folder. Now these files can be served by any HTTP server.

To spin up the Docker container, execute the following commands after building the sourcecode:

```bash
docker build -t citynexus .
docker run -dit --name citynexus -p 8080:80 citynexus
```

To get more info about the production Docker build, also check the `.gitlab-ci.yml` file.

## Kubernetes Minikube cluster

https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fdebian+package
https://minikube.sigs.k8s.io/docs/tutorials/nvidia/#docker
https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/#enable-shell-autocompletion

minikube start  --listen-address=0.0.0.0 --driver=docker --network-plugin=cni --cni=cilium --addons=metrics-server --container-runtime docker --gpus all