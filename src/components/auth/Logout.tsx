import supabase from "../../supabase/client.tsx";

const Logout = () => {
  const logout = () => {
    supabase.auth.signOut();
  };
  return (
    <div>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
};
export default Logout;
