// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  gapiClientConfig: {
    client_id: "450942942204-da6ea6nbspcgf7u0sa3c5nihvl9qd8ag.apps.googleusercontent.com",
    discoveryDocs: ["https://analyticsreporting.googleapis.com/$discovery/rest?version=v4"],
    scope: [
        "https://www.googleapis.com/auth/analytics.readonly",
        "https://www.googleapis.com/auth/analytics"
    ].join(" ")
  },
  firebase: {
    apiKey: "AIzaSyBXeW1WZMefY2Di8E82xK8qThD1hzBGFGE",
    authDomain: "qhacks18.firebaseapp.com",
    databaseURL: "https://qhacks18.firebaseio.com",
    projectId: "qhacks18",
    storageBucket: "qhacks18.appspot.com",
    messagingSenderId: "116821688573"
  },
  IBM_S2T_USERNAME: "6a859c4c-948f-4a97-a2ae-de8c64f61d99",
  IBM_S2T_PASSWORD: "IquS3NSBCZ02",
  TEXT_ANALYZER_KEY: "4f3eb6b2a6c1407fb94187a5fc1cdfa5"
};
