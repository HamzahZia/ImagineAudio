export const environment = {
  production: true,
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
  IBM_S2T_PASSWORD: "IquS3NSBCZ02"
};
