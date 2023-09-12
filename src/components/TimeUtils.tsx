// timeUtils.ts
export const formatTime = (time: number) => {
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
