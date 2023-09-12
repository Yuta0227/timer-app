import { useState, useEffect } from "react";
import supabase from "./supabase/client";
import { formatTime } from "./components/TimeUtils";

//後々他のカラムを使う際にタイプ指定する必要あり
type Record = {
  id: number;
  time: number;
};
function Records() {
  const [records, setRecords] = useState<Record[]>([]);
  useEffect(() => {
    getRecords();
  }, []);
  const getRecords = async () => {
    const { data, error } = await supabase.from("records").select("*");
    if (error) {
      console.log(error);
    } else {
      setRecords(data);
    }
  };
  return (
    <div>
      <div>記録一覧</div>
      <div>{records.map((record) => (
          <div key={record.id}>{record.id}: {formatTime(record.time)}</div>
        ))}</div>
    </div>
  );
}
export default Records;
