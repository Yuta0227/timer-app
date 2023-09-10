import { useMemo, useRef, useState } from "react";
import "./custom.d.ts";
import { Link } from "react-router-dom";
import { useAuth } from "./components/auth/AuthProvider";

function Timer() {
  const { user } = useAuth();
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
  const formatTime = (time: number) => {
    const intHour = Math.floor(time / 1000 / 60 / 60);
    const formattedHour = intHour < 10 ? `0${intHour}` : `${intHour}`;
    const intMinute = Math.floor(time / 1000 / 60) % 60;
    const formattedMinute = intMinute < 10 ? `0${intMinute}` : `${intMinute}`;
    const intSecond = Math.floor(time / 1000) % 60;
    const formattedSecond = intSecond < 10 ? `0${intSecond}` : `${intSecond}`;
    const intMilisecond = Math.floor(time / 10) % 100;
    const formattedMilisecond =
      intMilisecond < 10 ? `0${intMilisecond}` : `${intMilisecond}`;
    return (
      formattedHour +
      ":" +
      formattedMinute +
      ":" +
      formattedSecond +
      "." +
      formattedMilisecond
    );
  };
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
  return (
    <>
      <div>{user.email}</div>
      <div>{formatTime(time)}</div>
      <button onClick={isRunning ? stopTimer : startTimer}>
        {isRunning ? "停止" : "開始"}
      </button>
      <button onClick={isRunning ? lapTimer : resetTimer}>
        {time === initialTime ? "ラップ" : isRunning ? "ラップ" : "リセット"}
      </button>
      <div>{showLaps()}</div>
      <Link to="/">戻る</Link>
    </>
  );
}

export default Timer;
