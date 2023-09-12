import { Link } from "react-router-dom";
import { useAuth } from "./components/auth/AuthProvider";
function Home() {
  const { logout, user,profile } = useAuth();
  const handleLogout = async () => {
    await logout();
  };
  const loginDom = () => {
    if (user) {
      return (
        <>
          <div>you are logged in and your email address is {user.email}</div>
          <div>username:{profile?.name}</div>
          <div>description:{profile?.description}</div>
          <button onClick={handleLogout}>ログアウト</button>
        </>
      );
    } else {
      return (
        <div>
          <div>
            <Link to="register" state={{ from: "/" }}>
              登録
            </Link>
          </div>
          <div>
            <Link to="login" state={{ from: "/" }}>
              ログイン
            </Link>
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
        <Link to="timer" state={{ from: "/" }}>
          タイマー
        </Link>
      </div>
      <div>
        <Link to="ranking" state={{ from: "/" }}>
          ランキング
        </Link>
      </div>
    </>
  );
}
export default Home;
