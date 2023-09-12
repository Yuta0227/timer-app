import { useAuth } from "./components/AuthProvider";
import { useEffect } from "react";
import {useNavigate} from "react-router-dom";

const Profile = () => {
  const { user,profile } = useAuth();
  const navigate=useNavigate();
  useEffect(() => {
    console.log(profile)
    if(!user){
        alert('ログインしてください')
        navigate("/login",{state:{from:"/profile"}})
        return
    }
  },[])

  return (
    <>
      <div>profile</div>
      <div>{profile?.name}</div>
      <div>{profile?.description}</div>
    </>
  );
};
export default Profile;
