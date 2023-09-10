import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../../supabase/client.tsx";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  //ログイン時もログアウト時もセッションを更新する=>onauthchange発火
  const login = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });
  
  const logout = () => supabase.auth.signOut();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState();
  useEffect(() => {
    //ログイン経由でセッション更新なら
    if(session){
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
    }else{
      setUser(null)
    }
  }, [session]);
  //ログインするとセッションが更新される
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setSession(session);
      }else{
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
