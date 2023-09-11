import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import supabase from "../../supabase/client.tsx";
import { Session } from "@supabase/supabase-js";

type User = {
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
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
  const fetchUser = async (email:string|undefined) => {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    setUser(user);
  };
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        //set session
        fetchUser(session?.user.email);
      } else {
        setUser(null);
      }
    });
    setSessionToUser();
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);
  //レンダー毎にセッションを取得する
  const setSessionToUser=async()=>{
    const {data}= await supabase.auth.getSession();
    //セッションがあったらユーザー情報を取得
    if(data.session){
      fetchUser(data.session.user.email);
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
