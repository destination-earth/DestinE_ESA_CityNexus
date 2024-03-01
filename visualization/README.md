# Kepler.gl Webapp

This is the src code of kepler.gl demo app. You can copy this folder out and run it locally.

## 1. Setup (only once)

```sh
nvm install
corepack enable
yarn install
```

Apply the CORS configuration in ovh-cors-configuration.json:
1. Setup your AWS credentials as explained here: https://support.us.ovhcloud.com/hc/en-us/articles/4603838122643-Getting-Started-with-S3-Object-Storage
2. Apply the CORS configuration to the twincity-data bucket with:
aws s3api put-bucket-cors --bucket twincity-data --cors-configuration file://ovh-cors-configuration.json

## 2. Start the app

```sh
npm start
```

App will be running at http://localhost:8080

## 3. (Optional) Setting environment variables

Copy `.env.example` to `.env` and replace:
```
NEW_ENV_VARIABLE="new value"
```

The values can be accessed from within the code by using `process.env.NEW_ENV_VARIABLE`.
