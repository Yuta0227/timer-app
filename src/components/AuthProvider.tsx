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
  const addUserToOneSignal = async (user_id: string) => {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          // tags: {key: 'value', foo: 'bar'},
          language: "ja",
          timezone_id: "Asia/Tokyo",
          lat: 90,
          long: 135,
          country: "JP",
          first_active: 1678215680,
          last_active: 1678215682,
        },
        identity: { external_id: user_id },
        subscriptions: [
          {
            type: "SafariPush",
            token:OneSignal.User.PushSubscription.token,
            enabled: true,
            session_time: 60,
            session_count: 1,
            sdk: "5.0.0",
            device_model: "iPhone 14",
            device_os: "16.0.0",
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
            device_model: "iPhone 14",
            device_os: "16.0.0",
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
  const sendTestNotification = async (notificationMessage:string) => {
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
  const viewOneSignalUser = async (userId: string) => {
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
        console.log(response)
        console.log(OneSignal.User.PushSubscription.token)
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
        "/users/by/external_id/"+userId,
      options
    )
      .then((response) => response.json())
      .then((response) => console.log(response))
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    // console.log(errors);
  }, [errors]);
  return (
    <AuthContext.Provider value={{ user, profile, login, logout }}>
      {children}
      <div>notification{notification}</div>
      <div>errors{errors}</div>
      <button onClick={()=>sendTestNotification('これはテスト通知')}>send notifications</button>
      <button onClick={user?()=>addUserToOneSignal(user?.id):()=>{}}>add user to onesignal</button>
      <button onClick={user?()=>viewOneSignalUser(user?.id):()=>{}}>view this onesignal user</button>
      <button onClick={user?()=>deleteOneSignalUser(user?.id):()=>{}}>delete this onesignal user</button>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
