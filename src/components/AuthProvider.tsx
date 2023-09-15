import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import supabase from "../supabase/client.tsx";
import OneSignal from "react-onesignal";
type User = {
  id: string;
  email: string;
};
type Profile = {
  name: string;
  description: string;
};
type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
type MyComponentProps = {
  children: ReactNode;
};
const AuthProvider: React.FC<MyComponentProps> = ({ children }) => {
  //ログイン時もログアウト時もセッションを更新する=>onauthchange発火
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw new Error("ログイン失敗");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error("ログアウト失敗");
    } else {
      setUser(null);
      setProfile(null);
      window.location.reload();
    }
  };
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [oneSignalInitialized, setOneSignalInitialized] =
    useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  //ログイン時と通常にアクセスしたときにセッション確認してセット
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        try {
          getUser();
        } catch (error) {
          console.error(error);
        }
      }
    });
    retrieveSession();
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);
  const getUser = async () => {
    try {
      const response = await supabase.auth.getUser();
      if (response.error) {
        console.log(response.error);
        return;
      } else if (response.data.user.id && response.data.user.email) {
        setUser({ id: response.data.user.id, email: response.data.user.email });
        getProfile(response.data.user.id);
        //onesignal
        initializeOneSignal();
      }
    } catch (error) {
      console.error(error);
    }
  };
  const initializeOneSignal = async () => {
    if (oneSignalInitialized) {
      console.log("yes");
      return;
    }
    setOneSignalInitialized(true);
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    let allowLocalhostAsSecureOrigin;
    if (import.meta.env.VITE_APP_ENV === "localhost") {
      allowLocalhostAsSecureOrigin = true;
    } else {
      allowLocalhostAsSecureOrigin = false;
    }
    await OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      notifyButton: {
        enable: true,
      },
      allowLocalhostAsSecureOrigin: allowLocalhostAsSecureOrigin,
    });

    OneSignal.Slidedown.promptPush();
  };

  // Function to extract device model and OS from user agent string
  function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let deviceModel = "Unknown";
    let deviceOS = "Unknown";

    // Check for common device and OS patterns in the user agent string
    if (/(iPhone|iPad)/.test(userAgent)) {
      deviceModel = "iPhone or iPad";
      // Extract iOS version
      const iosVersionMatch = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
      if (iosVersionMatch) {
        deviceOS = `iOS ${iosVersionMatch[1]}.${iosVersionMatch[2]}`;
      }
    } else if (/Android/.test(userAgent)) {
      deviceModel = "Android Device";
      // Extract Android version
      const androidVersionMatch = userAgent.match(/Android (\d+(\.\d+)?)/);
      if (androidVersionMatch) {
        deviceOS = `Android ${androidVersionMatch[1]}`;
      }
    } else if (/Windows NT/.test(userAgent)) {
      deviceModel = "Windows PC";
      // Extract Windows version
      const windowsVersionMatch = userAgent.match(/Windows NT (\d+(\.\d+)?)/);
      if (windowsVersionMatch) {
        deviceOS = `Windows ${windowsVersionMatch[1]}`;
      }
    } else if (/Mac OS X/.test(userAgent)) {
      deviceModel = "Mac";
      // Extract macOS version
      const macVersionMatch = userAgent.match(/Mac OS X (\d+(_\d+)*)/);
      if (macVersionMatch) {
        deviceOS = `macOS ${macVersionMatch[1].replace(/_/g, ".")}`;
      }
    } else if (/Linux/.test(userAgent)) {
      deviceModel = "Linux PC";
      // Extract Linux distribution/version (if available)
      // This is more complex and may require additional regex patterns
    }

    return { deviceModel, deviceOS };
  }
  const { deviceModel, deviceOS } = getDeviceInfo();

  console.log(`Device Model: ${deviceModel}`);
  console.log(`Device OS: ${deviceOS}`);

  const addUserToOneSignal = async (
    user_id: string,
    deviceModel: string,
    deviceOS: string
  ) => {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          language: "ja",
          timezone_id: "Asia/Tokyo",
          lat: 90,
          long: 135,
          country: "JP",
          first_active: Math.floor(Date.now() / 1000),
          last_active: Math.floor(Date.now() / 1000),
        },
        identity: { external_id: user_id },
        subscriptions: [
          {
            type: "SafariPush",
            token: OneSignal.User.PushSubscription.token,
            enabled: true,
            session_time: 60,
            session_count: 1,
            sdk: "5.0.0",
            device_model: deviceModel,
            device_os: deviceOS,
            rooted: false,
            app_version: "1.0.0",
          },
          {
            type: "ChromePush",
            token: OneSignal.User.PushSubscription.token,
            enabled: true,
            session_time: 60,
            session_count: 1,
            sdk: "5.0.0",
            device_model: deviceModel,
            device_os: deviceOS,
            rooted: false,
            app_version: "1.0.0",
          },
        ],
      }),
    };

    fetch(
      "https://onesignal.com/api/v1/apps/" +
        import.meta.env.VITE_ONESIGNAL_APP_ID +
        "/users",
      options
    )
      .then((response) => response.json())
      .then((response) => {
        console.log("ユーザー追加");
        console.log(response);
        if (response.errors) {
          setErrors([response.errors[0].title, ...errors]);
        }
      })
      .catch((err) => console.error(err));
  };
  const sendTestNotification = async (notificationMessage: string) => {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: "Basic " + import.meta.env.VITE_ONESIGNAL_REST_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        included_segments: ["test"],
        contents: {
          en: notificationMessage,
          es: "Spanish Message",
        },
        name: "INTERNAL_CAMPAIGN_NAME",
        app_id: import.meta.env.VITE_ONESIGNAL_APP_ID,
      }),
    };
    fetch("https://onesignal.com/api/v1/notifications", options)
      .then((response) => response.json())
      .then((response) => {
        if (response.errors) {
          console.error(response.errors);
          setErrors([response.errors[0], ...errors]);
        }
        setNotification(response.id);
      })
      .catch((err) => console.error(err));
  };
  const getProfile = async (userId: string) => {
    try {
      const response = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (response.error) {
        console.log(response.error);
        return;
      }
      setProfile({
        name: response.data.name,
        description: response.data.description,
      });
    } catch (error) {
      console.error(error);
    }
  };
  const retrieveSession = async () => {
    try {
      const response = await supabase.auth.getSession();
      if (response.error) {
        console.log(response.error);
        return;
      } else if (response.data.session) {
        getUser();
      }
    } catch (error) {
      console.error(error);
    }
  };
  const addUserIfNotSubscribedToPush = async (userId: string) => {
    const options = { method: "GET", headers: { accept: "application/json" } };

    fetch(
      "https://onesignal.com/api/v1/apps/" +
        import.meta.env.VITE_ONESIGNAL_APP_ID +
        "/users/by/external_id/" +
        userId,
      options
    )
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        if (!response.subscriptions) {
          console.log("yes");
          addUserToOneSignal(userId, deviceModel, deviceOS);
        }
        OneSignal.login(userId)
        console.log(OneSignal.User.PushSubscription);
        console.log(OneSignal.User.PushSubscription.token);
      })
      .catch((err) => console.error(err));
  };
  const deleteOneSignalUser = async (userId: string) => {
    const options = {
      method: "DELETE",
      headers: { accept: "application/json" },
    };

    fetch(
      "https://onesignal.com/api/v1/apps/" +
        import.meta.env.VITE_ONESIGNAL_APP_ID +
        "/users/by/external_id/" +
        userId,
      options
    )
      .then((response) => response.json())
      .then((response) => console.log(response))
      .catch((err) => console.error(err));
  };
  return (
    <AuthContext.Provider value={{ user, profile, login, logout }}>
      {children}
      <div>notification{notification}</div>
      <div>errors{errors}</div>
      <button onClick={() => sendTestNotification("これはテスト通知")}>
        send notifications
      </button>
      <button
        onClick={user ? () => addUserIfNotSubscribedToPush(user?.id) : () => {}}
      >
        add user if not subscribed to push
      </button>
      <button onClick={user ? () => deleteOneSignalUser(user?.id) : () => {}}>
        delete this onesignal user
      </button>
      <div>token:{OneSignal.User.PushSubscription.token}</div>
      <div>
        supports push{OneSignal.Notifications.isPushSupported().toString()}
      </div>
      <div>device_os{deviceOS}</div>
      <div>device_model{deviceModel}</div>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
