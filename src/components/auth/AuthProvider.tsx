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
  const login = async (email: string, password: string):Promise<void> =>{
    try{
      const response=await supabase.auth.signInWithPassword({ email, password });
      if(response.error){
        throw new Error((await response).error.message);
      }
    }catch(error){
      console.error(error);
      throw error;
    }
  }

  const logout = () => supabase.auth.signOut();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>();
  useEffect(() => {
    //ログイン経由でセッション更新なら
    if (session) {
      const fetchUser = async () => {
        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("email", session.user.email)
          .single();
        setUser(user);
      };
      fetchUser();
      //ログアウト経由でセッション更新なら
    } else {
      setUser(null);
    }
  }, [session]);
  //ログインするとセッションが更新される
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setSession(session);
      } else {
        setSession(null);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
