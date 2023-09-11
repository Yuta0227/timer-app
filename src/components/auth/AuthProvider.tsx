import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import supabase from "../../supabase/client.tsx";

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
    }
  };
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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
    const session = supabase.auth.getSession();
    console.log(session);
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
      }
      const userData = response.data?.user || {};
      const id = userData.id || "";
      const email = userData.email || "";
      setUser({ id:id, email:email });
      getProfile(id);
    } catch (error) {
      console.error(error);
    }
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
      console.log(response.data);
      // setProfile(res.data)
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <AuthContext.Provider value={{ user, profile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
