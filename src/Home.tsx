import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "./supabase/client.tsx";
import Logout from './components/auth/Logout.tsx';
function Home() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);
  const loginDom = () => {
    if (session) {
      return (
        <>
          <div>
            you are logged in and your email address is {session.user.email}
          </div>
          <Logout/>
        </>
      );
    } else {
      return (
        <div>
          <div>
            <Link to="register">登録</Link>
          </div>
          <div>
            <Link to="login">ログイン</Link>
          </div>
        </div>
      );
    }
  };
  return (
    <>
      <h1>Home</h1>
      {loginDom()}
      <div>
        <Link to="timer">タイマー</Link>
      </div>
      <div>
        <Link to="ranking">ランキング</Link>
      </div>
    </>
  );
}
export default Home;
