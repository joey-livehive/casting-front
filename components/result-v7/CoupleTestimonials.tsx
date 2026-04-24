import Image from 'next/image';
import { Section, SectionLabel, SectionTitle, HL } from './SectionFrame';

const cases = [
  {
    no: 'CASE 001 · OFFLINE',
    photo: '/images/couples/case-002.jpg',
    names: 'J & S',
    meta: '강남 헬스장',
    quote:
      '소개팅앱 6개월을 써도 만나지 못한 사람을 2주 만에 만났습니다! 소개팅앱을 전혀 안써본 사람을 여기서 만날 수 있다는 게 너무 큰 장점같네요',
  },
  {
    no: 'CASE 002 · INSTAGRAM',
    photo: '/images/couples/case-new-002.jpg',
    names: 'K & H',
    meta: 'Instagram 캐스팅',
    quote:
      '제 성향을 이렇게까지 파악하고 데려올 줄 몰랐습니다. 덕분에 6개월만에 결혼 약속하고 신혼부부로 알콩달콩 잘 살고 있습니다!',
  },
  {
    no: 'CASE 003 · LINKEDIN',
    photo: '/images/couples/case-003.jpg',
    names: 'M & Y',
    meta: 'LinkedIn 캐스팅',
    quote:
      '가벼운 만남이 지겨웠는데, 처음부터 진지한 태도로 만남을 이어가는 중입니다. 감사합니다!',
  },
];

export function CoupleTestimonials() {
  return (
    <>
      <Section>
        <SectionLabel>CASE RECORDS</SectionLabel>
        <SectionTitle>
          <HL>SomeOneTheOne</HL>에서
          <br />
          성사된 만남들.
        </SectionTitle>
      </Section>

      <div className="couples-scroll">
        {cases.map((c) => (
          <div key={c.no} className="couple-card">
            <div className="cp-photo" onContextMenu={(e) => e.preventDefault()}>
              <Image
                src={c.photo}
                alt=""
                fill
                sizes="240px"
                draggable={false}
                className="cp-photo-img"
                style={{
                  objectFit: 'cover',
                  filter: 'blur(8px) saturate(1.05)',
                  transform: 'scale(1.15)',
                  pointerEvents: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserDrag: 'none',
                } as React.CSSProperties}
              />
            </div>
            <div className="cp-body">
              <div className="cp-no">{c.no}</div>
              <div className="cp-names">{c.names}</div>
              <div className="cp-meta">{c.meta}</div>
              <p className="cp-quote">{c.quote}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
