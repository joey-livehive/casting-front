export function Hero({ userName }: { userName: string }) {
  return (
    <div className="hero">
      <span className="kicker">PRIVATE CASTING</span>
      <h1>
        {userName}님만을 위한
        <br />
        <span className="accent">캐스팅</span>을
        <br />
        마쳤습니다.
      </h1>
      <p className="hero-sub">
        오프라인 현장, Instagram, LinkedIn에서
        <br />
        의뢰인님의 기준에 부합하는 사람을 찾았습니다.
      </p>
    </div>
  );
}
