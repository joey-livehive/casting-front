import { Section, SectionLabel, SectionTitle, HL } from './SectionFrame';

const rows: {
  k: string;
  marry: string;
  marryDim?: boolean;
  app: string;
  appDim?: boolean;
  us: string;
  usDim?: boolean;
}[] = [
  { k: 'Price', marry: '수백만원', app: '월 구독', us: '3–10만원' },
  { k: 'Scope', marry: '내부 DB', marryDim: true, app: '앱 내부', appDim: true, us: '앱 밖 포함' },
  { k: 'Duration', marry: '1–3개월', marryDim: true, app: '즉시', appDim: true, us: '7일' },
  { k: 'Verified', marry: '매니저', app: '없음', appDim: true, us: 'AI + 매니저' },
];

export function PriceCompare() {
  return (
    <>
      <Section>
        <SectionLabel>MARKET COMPARISON</SectionLabel>
        <SectionTitle>
          가격 대비
          <br />
          <HL>어떻게</HL> 다른가.
        </SectionTitle>
      </Section>

      <div className="price-compare" style={{ gridTemplateColumns: '1fr 1.3fr 1fr' }}>
        <div className="pc-col">
          <div className="pc-brand">결혼정보회사</div>
          {rows.map((r) => (
            <div key={r.k} className="pc-row">
              <div className="pc-k">{r.k}</div>
              <div className={`pc-v${r.marryDim ? ' dim' : ''}`}>{r.marry}</div>
            </div>
          ))}
        </div>
        <div className="pc-col us" style={{ transform: 'scale(1.04)', zIndex: 1 }}>
          <div className="pc-brand">someonetheone</div>
          {rows.map((r) => (
            <div key={r.k} className="pc-row">
              <div className="pc-k">{r.k}</div>
              <div className={`pc-v${r.usDim ? ' dim' : ''}`}>{r.us}</div>
            </div>
          ))}
        </div>
        <div className="pc-col">
          <div className="pc-brand">소개팅앱</div>
          {rows.map((r) => (
            <div key={r.k} className="pc-row">
              <div className="pc-k">{r.k}</div>
              <div className={`pc-v${r.appDim ? ' dim' : ''}`}>{r.app}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pc-caption">
        결혼정보회사 가격의 <b>1/20</b>, 범위는 더 넓습니다.
      </div>
    </>
  );
}
