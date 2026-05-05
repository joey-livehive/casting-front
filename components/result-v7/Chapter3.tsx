import { MatchAnalysis } from '@/lib/report/types';
import { Section, SectionLabel, SectionTitle, HL, SectionSub } from './SectionFrame';
import { RadarChart } from './RadarChart';

/** v7 축별 코멘트 — mockData 해요체 대체 합쇼체 고정 텍스트. */
const matchNotes: { label: string; score: string; desc: React.ReactNode }[] = [
  {
    label: '정서적 안정감',
    score: '8.7 / 9.0',
    desc: '의뢰인님께서 가장 중시하는 축입니다. 거의 겹칩니다.',
  },
  {
    label: '자기 몰입도',
    score: '8.3 / 8.0',
    desc: (
      <>
        이 분은 <span className="v7-blur-light">◯◯◯◯</span>에서 꾸준히 성과를 내고 있습니다.
      </>
    ),
  },
  {
    label: '커뮤니케이션',
    score: '8.0 / 8.5',
    desc: '회피 없이 직면하는 스타일. 의뢰인님의 취향에 부합합니다.',
  },
];

export function Chapter3({ match }: { userName: string; match: MatchAnalysis }) {
  return (
    <>
      <Section>
        <SectionLabel>03. THE MATCH</SectionLabel>
        <SectionTitle>
          의뢰인님의 기준에
          <br />
          <HL>부합하는</HL> 상대.
        </SectionTitle>
        <SectionSub>6개 축을 비교 분석했습니다.</SectionSub>
      </Section>

      <div className="chapter">
        <div className="match-score">
          <span className="match-score-label">일치도</span>
          <div className="match-score-val">
            <span className="num">{match.matchRate}</span>
            <span className="pct">%</span>
            <span className="rank">TOP {match.topPercent}%</span>
          </div>
        </div>

        <div className="radar-legend">
          <span className="them">일치도</span>
        </div>
        <div className="radar-wrap">
          <RadarChart data={match.radarData} />
        </div>

        <div className="match-notes">
          {matchNotes.map((n) => (
            <div key={n.label} className="mn-item">
              <div className="mn-axis">
                <span className="mn-axis-label">{n.label}</span>
                <span className="mn-axis-score">{n.score}</span>
              </div>
              <p className="mn-desc">{n.desc}</p>
            </div>
          ))}
        </div>

        <div className="sim-box">
          <div className="sim-tag">IF YOU MEET</div>
          <p className="sim-body">
            첫 만남은 <b>조용한 카페</b>일 가능성이 큽니다. 이 분은 첫 자리에서 술 대신 커피를
            선호합니다. 의뢰인님 또한 시끄러운 공간에서의 첫 대화를 불편해하는 유형이므로 잘
            맞습니다.
            <br />
            <br />
            대화는 자연스럽게 <span className="v7-blur">◯◯◯◯◯</span>으로 흐를 가능성이 높습니다. 이
            분이 이 주제에서 표현이 풍부해지는 패턴이 관찰되었습니다.
            <br />
            <br />세 번째 만남쯤 <span className="v7-blur">◯◯◯◯◯◯</span>을 함께 제안할 확률이
            높습니다.
          </p>
        </div>
      </div>
    </>
  );
}
