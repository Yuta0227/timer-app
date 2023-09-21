import { useState, useEffect } from "react";
import supabase from "../api/CreateSupabaseClient";
import { formatTime } from "./components/TimeUtils";
import { useAuth } from "./components/AuthProvider";
type Record = {
  name: string;
  userId: string;
  id: number;
  time: string;
  isOwner: boolean;
};
type UserData = {
  name: string;
};
type NewPayload = {
  id: number;
  time: number;
  user_id: string;
};
function Records() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const userCache = new Map<string, UserData>();
  const fetchUserName = async (userId: string) => {
    if (userCache.has(userId)) {
      return userCache.get(userId);
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", userId)
      .single();
    if (error) {
      console.log(error);
    } else {
      userCache.set(userId, data);
      return data;
    }
  };
  const fetchInitialData = async () => {
    const { data, error } = await supabase.from("records").select("*");
    if (error) {
      console.log(error);
    } else {
      const recordsWithUserName = await Promise.all(
        data.map(async (record) => {
          // Fetch user data from the cache or database
          const userData = await fetchUserName(record.user_id);
          // Create a new object that includes the user's name
          console.log(record.user_id === user?.id);
          return {
            id: record.id,
            time: formatTime(record.time),
            userId: record.user_id,
            name: userData?.name,
            isOwner: record.user_id === user?.id,
          };
        })
      );
      setRecords(recordsWithUserName);
    }
  };
  useEffect(() => {
    if (user) {
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
          async (payload) => {
            const newPayload = payload.new as NewPayload;
            if (newPayload) {
              const userData = await fetchUserName(newPayload.user_id);
              // Handle the real-time update here
              // You can update your state or perform any other actions as needed
              if (userData) {
                setRecords((prev) => [
                  ...prev,
                  {
                    id: newPayload.id,
                    time: formatTime(newPayload.time),
                    userId: newPayload.user_id,
                    name: userData.name,
                    isOwner: newPayload.user_id === user?.id,
                  } as Record,
                ]);
              }
            }
          }
        )
        .subscribe();

      return () => {
        // Unsubscribe when the component unmounts
        changes.unsubscribe();
      };
    }
  }, [user]);
  return (
    <div>
      <div>記録一覧</div>
      <div>
        {records.map((record) => (
          <div key={record.id}>
            <span
              style={{ color: record.isOwner ? "red" : "black" }}
            >{`ID: ${record.id} 名前: ${record.name}時間: ${record.time}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Records;
