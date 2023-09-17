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
      OneSignal.logout().then((response) => {
        console.log(response);
      });
      setUser(null);
      setProfile(null);
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
    initializeOneSignal();
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
        //register時はエラーでない。login時はエラー出るが、気にしないでいい
        OneSignal.login(response.data.user.id).then(() => {
          console.log("onesignal login success");
        });
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
  const sendTestNotificationBasedOnSegments = async (
    notificationMessage: string
  ) => {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: "Basic " + import.meta.env.VITE_ONESIGNAL_REST_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        included_segments: ["Active Subscriptions"],
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
        if (response.errors) {
          console.log("user does not exist");
        } else {
          console.log("user exists");
        }
        console.log(response);
      })
      .catch((err) => console.error(err));
  };
  const [notificationPermission, setNotificationPermission] = useState<boolean|null>(null)
  const handleNotificationPermission = async () => {
    if(OneSignal.User.PushSubscription.optedIn){
      OneSignal.User.PushSubscription.optOut()
      console.log('opted out');
      setNotificationPermission(false)
    }else{
      OneSignal.User.PushSubscription.optIn();
      console.log('opted in');
      setNotificationPermission(true)
    }
  };
  useEffect(()=>{
    if(OneSignal.User.PushSubscription.optedIn){
      setNotificationPermission(true)
    }else{
      setNotificationPermission(false)
    }
  },[])
  return (
    <AuthContext.Provider value={{ user, profile, login, logout }}>
      {children}
      <div>notification{notification}</div>
      <div>errors{errors}</div>
      <button
        onClick={() =>
          sendTestNotificationBasedOnSegments(
            "これは通知ONにしている全てのユーザーに送られるテスト通知"
          )
        }
      >
        send notifications
      </button>
      <button onClick={user ? () => viewOneSignalUser(user?.id) : () => {}}>
        コンソールでユーザーの存在を確認
      </button>
      <div>トークンの有無:{typeof OneSignal.User.PushSubscription.token}</div>
      <button onClick={handleNotificationPermission}>
        {notificationPermission?'通知を許可しない':'通知を許可する'}
      </button>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
