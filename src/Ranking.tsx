import { useState, useEffect } from "react";
import supabase from "./supabase/client";
//後々他のカラムを使う際にタイプ指定する必要あり
type Record = {
  id: number;
  time: number;
};
function Ranking() {
  const [ranking, setRanking] = useState<Record[]>([]);
  useEffect(() => {
    getRanking();
  }, []);
  const getRanking = async () => {
    const { data, error } = await supabase.from("records").select("*");
    if (error) {
      console.log(error);
    } else {
      setRanking(data);
    }
  };
  return (
    <div>
      <div>ランキング</div>
      <div>{ranking.map((record) => (
          <div key={record.id}>{record.id}: {record.time}</div>
        ))}</div>
    </div>
  );
}
export default Ranking;
