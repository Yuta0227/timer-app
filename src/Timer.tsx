import { useMemo, useRef, useState } from "react";
import "./custom.d.ts";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./components/AuthProvider.tsx";
import supabase from "../api/CreateSupabaseClient.tsx";
import { formatTime } from "./components/TimeUtils";
import Records from "./Records.tsx";

function Timer() {
  const navigate = useNavigate();
  const { user,profile } = useAuth();
  type Lap = {
    name: string;
    startTime: number;
    endTime: number;
  };
  const initialTime = 0;
  const [time, setTime] = useState(initialTime);
  const timerRef = useRef<Timeout | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const latestLap = useMemo(() => {
    if (laps[0]) {
      //初回以外
      return {
        name: "ラップ" + (laps.length + 1),
        startTime: laps[0].endTime,
        key: laps.length,
      };
    } else {
      //初回
      return {
        name: "ラップ" + (laps.length + 1),
        startTime: initialTime,
        key: laps.length,
      };
    }
  }, [laps, time]);
  const lapList = laps.map((lap, index) => {
    const lapTime =
      lap.endTime !== null ? lap.endTime - lap.startTime : time - lap.startTime;
    return (
      <li key={index}>
        {lap.name}:{formatTime(lapTime)}
      </li>
    );
  });
  const startTimer = () => {
    const timer = setInterval(() => {
      setTime((prevTime) => prevTime + 10);
    }, 10);
    timerRef.current = timer;
    //停止ボタンに変更する
    setIsRunning(true);
  };
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    //開始ボタンに変更する
    setIsRunning(false);
  };
  const resetTimer = () => {
    //timerリセット＝0になる
    setTime(initialTime);
    //すべてのラップが消える
    setLaps([]);
    setIsRunning(false);
  };
  const lapTimer = () => {
    //前回のラップの終了時間を設定する
    setLaps([
      { name: latestLap.name, startTime: latestLap.startTime, endTime: time },
      ...laps,
    ]);
  };
  const showLaps = () => {
    if (time !== initialTime) {
      //初期状態
      return (
        <>
          <li key={latestLap.key}>
            {latestLap.name}:{formatTime(time - latestLap.startTime)}
          </li>
          {lapList}
        </>
      );
    }
  };
  const postPublicTime = async () => {
    if(user){
      await supabase.from("records").insert({
        user_id: user.id,
        time: time,
        is_public: true,
      });
      stopTimer();
      resetTimer();
      alert("公開記録を登録した");
    }else{
      alert("ログインしてください")
      navigate("/login", { state: { from: "/timer" } });
    }
  };
  const postPrivateTime = async () => {
    if(user){
      await supabase
      .from("records")
      .insert({
        user_id: user.id,
        time: time,
        is_public: false,
      })
      .then(() => {
        stopTimer();
        resetTimer();
        alert("非公開記録を登録しました");
      });
    }else{
      alert("ログインしてください")
      navigate("/login", { state: { from: "/timer" } });
    }
  };
  return (
    <>
      <div>{!user ? "未ログイン" : user.email}</div>
      <div>{!profile ? "未ログイン" : profile.name}</div>
      <div>{formatTime(time)}</div>
      <button onClick={isRunning ? stopTimer : startTimer}>
        {isRunning ? "停止" : "開始"}
      </button>
      <button onClick={isRunning ? lapTimer : resetTimer}>
        {time === initialTime ? "ラップ" : isRunning ? "ラップ" : "リセット"}
      </button>
      {time !== initialTime ? (
        <button onClick={postPublicTime}>公開記録を登録する</button>
      ) : (
        ""
      )}
      {time !== initialTime ? (
        <button onClick={postPrivateTime}>非公開記録を登録する</button>
      ) : (
        ""
      )}
      <div>{showLaps()}</div>
      <Records />
      <Link to="/" state={{ from: "/timer" }}>
        戻る
      </Link>
    </>
  );
}

export default Timer;
