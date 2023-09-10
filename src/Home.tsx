import { Link } from "react-router-dom";
import { useAuth } from "./components/auth/AuthProvider.tsx";
function Home() {
  const { logout } = useAuth();
  const { user } = useAuth();
  const handleLogout=async()=>{
    await logout();
  }
  const loginDom = () => {
    if (user) {
      return (
        <>
          <div>
            you are logged in and your email address is {user.email}
          </div>
          <div>
            username is {user.name}
          </div>
          <button onClick={handleLogout}>ログアウト</button>
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
