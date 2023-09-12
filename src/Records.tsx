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
  isOwner: boolean;
};
function Records() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  useEffect(() => {
    getRecords();
  }, []);
  const getRecords = async () => {
    const { data, error } = await supabase
      .from("records_with_names")
      .select("*");
    if (error) {
      console.log(error);
    } else {
      //check if the user is the owner of the record
      data.map((record) => {
        console.log(record.user_id, user?.id);
        if (record.user_id === user?.id) {
          record.isOwner = true;
        } else {
          record.isOwner = false;
        }
      });
      setRecords(data);
    }
  };
  return (
    <div>
      <div>記録一覧</div>
      <div>
        {records.map((record) => (
          <div key={record.id}>
            <span style={{ color: record.isOwner ? "red" : "black" }}>
              ID:{record.id}
              名前:{record.name}
              時間: {formatTime(record.time)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Records;
