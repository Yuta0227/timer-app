import { useState, useEffect } from "react";
import supabase from "./supabase/client";
import { formatTime } from "./components/TimeUtils";
import { useAuth } from "./components/AuthProvider";
//後々他のカラムを使う際にタイプ指定する必要あり
type Record = {
  name: string;
  user_id: string;
  id: number;
  time: number;
};
type UserData = {
  name: string;
}
function Records() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const userCache=new Map<string,UserData>();
  //viewではなくちゃんとテーブルを参照する。viewだと更新が反映されないかも
  // usestateで管理したい
  //changesをsetする
  // https://zenn.dev/chot/articles/ddd2844ad3ae61
  const fetchUserData = async (userId: string) => {
    if(userCache.has(userId)){
      return userCache.get(userId);
    }
    const {data,error}=await supabase.from('profiles').select('name').eq('id',userId).single();
    if(error){
      console.log(error);
    }else{
      userCache.set(userId,data);
      return data;
    }
  }
  const fetchInitialData = async () => {
    const { data, error } = await supabase.from("records").select("*");
    if (error) {
      console.log(error);
    } else {
      const recordsWithUserName = await Promise.all(
        data.map(async (record) => {
          // Fetch user data from the cache or database
          const userData = await fetchUserData(record.user_id);

          // Create a new object that includes the user's name
          return {
            ...record,
            name: userData?.name,
          };
        })
      );
      setRecords(recordsWithUserName);
    }
  };
  useEffect(() => {
    fetchInitialData();
    // Create a channel and listen for real-time updates on "records" table
    const changes = supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "records", // Change this to your "records" table name
        },
        (payload) => {
          console.log("Change payload:", payload);
          console.log(payload.new);
          if (payload.new) {
            // Handle the real-time update here
            // You can update your state or perform any other actions as needed
            setRecords((prev) => [...prev, payload.new as Record]);
          }
        }
      )
      .subscribe();

    return () => {
      // Unsubscribe when the component unmounts
      changes.unsubscribe();
    };
  }, []);

  return (
    <div>
      <div>記録一覧</div>
      <div>
        {records.map((record) => (
          <div key={record.id}>
            <span>{`ID: ${record.id} 名前: ${record.name}時間: ${record.time}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Records;
