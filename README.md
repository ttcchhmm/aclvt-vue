# ACLVT-Vue
A remake of the original [ACLVT](https://tiralex1.github.io/ACLV/) website made with [Vue.js](https://vuejs.org/) and [Pinia](https://pinia.vuejs.org/).

## Building the frontend
Vite is used as the toolchain for this project with NPM as the package manager. To make a production build of the site run the following commands :
```bash
npm i
npm run build
```

You will find the compiled build in the `dist` folder.

## Running the backend
The backend is simply a JavaScript file that should be run at regular intervals. Unit files for systemd are provided under the `metadata-updater` folder, just make sure to replace any TODOs in the service file.