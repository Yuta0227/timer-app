import OneSignal from "react-onesignal";

export default async function runOneSignal() {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  let allowLocalhostAsSecureOrigin;
  if (import.meta.env.VITE_APP_ENV === "localhost") {
    allowLocalhostAsSecureOrigin = true;
  } else {
    allowLocalhostAsSecureOrigin = false;
  }
  await OneSignal.init({
    appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
    notifyButton:{
        enable:true
    },
    allowLocalhostAsSecureOrigin: allowLocalhostAsSecureOrigin,
  });
  OneSignal.Slidedown.promptPush();
}
