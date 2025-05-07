## OVH Deployment Guide for GitLab
As we are using the image on Harbor to deploy to both OVH machine and DESP, we can directly use `.gitlab-ci.yaml` instead of `.immerseon-ci.yaml` for building the image that will be deployed to OVH.

All OVH helm charts are under `charts` folder, not `deployment` folder.

### Step 1: Update Version in `gitlab-ci.yaml` (Optional)
For each component that contains the changes, increment the version number. You can also use the same image tag, but keep in mind that when you deploy on OVH, delete the existing image and then deploy.

### Step 2: Build the Image Using GitLab CI/CD

1. Push your changes to the DESP repository to trigger the pipeline. If you want to test your changes on your feature branch, remove `only: develop` from the `gitlab-ci.yaml`
2. Verify that the pipeline successfully builds the images and pushes to Harbor

### Step 3: Update `values.yaml` in the Helm Charts

1. Locate the `values.yaml` file under the `charts` folder.
2. Update the `image.tag` for the component that you want to redeploy to match the new version built in the previous step.
3. Copy the code to OVH machine
   ```bash
   scp -r /path/to/IMMERSIVE-EO/charts ubuntu@91.134.32.117:IMMERSIVE-EO
   ```

### Step 4: Update NGINX Configuration (if needed)
If the NGINX configuration has been updated:

1. Access the running `http-nginx` container on OVH machine:
   ```bash
   docker exec -it 4c16158b8809_http-proxy_nginx_1 sh
   ```
2. Navigate to the configuration file and edit the file:
   ```bash
   nano /etc/nginx/conf.d/citynexus.conf
   ```
3. Save the changes and exit the editor
4. Reload NGINX to apply the updated configuration:
   ```bash
   nginx -s reload
   ```
### Step 5: Upgrade the Helm Release
1. login to OVH machine
   ```bash
   ssh ubuntu@91.134.32.117
   ```
2. Upgrade helm release
   ```bash
   helm upgrade release IMMERSIVE-EO/
   ```

