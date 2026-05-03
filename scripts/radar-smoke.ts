import { computePairRadar, checkDealbreakers } from '../lib/casting/radar/index';

const viewer = {
  '얼마나 자주 만나고 싶어?': 'flexible_meet',
  '연락은 얼마나 자주가 좋아?': 'contact_relaxed',
  '어떤 데이트가 좋아?': 'culture',
  '넌 지금 얼마나 진지해?': 'serious_dating',
  '연인이 담배 피운다면?': 'pref_smoke_meh',
  '넌 담배 피워?': 'no_smoke',
  '술은 자주 마셔?': 'rarely_drink',
  'MBTI 뭐야?': 'ENFP',
  '넌 어디쯤 사는데?': 'other_region',
  '상대와 거리는 어디까지?': 'long_distance',
};
const candidate = {
  '얼마나 자주 만나고 싶어?': 'weekly_3_4',
  '연락은 얼마나 자주가 좋아?': 'contact_anytime',
  '어떤 데이트가 좋아?': 'culture',
  '넌 지금 얼마나 진지해?': 'serious_dating',
  '연인이 담배 피운다면?': 'pref_smoke_no',
  '넌 담배 피워?': 'no_smoke',
  '술은 자주 마셔?': 'rarely_drink',
  'MBTI 뭐야?': 'ISFJ',
  '넌 어디쯤 사는데?': 'seoul',
  '상대와 거리는 어디까지?': 'same_city',
};

const r = computePairRadar(viewer, candidate);
console.log('matchRate:', r.matchRate, '%');
console.log('axes:');
r.axes.forEach(a => console.log(`  ${a.label.replace(/\n/g,' ')}: v=${a.viewerScore} c=${a.candidateScore} align=${a.alignment} pair=${a.pairScore.toFixed(2)}`));
console.log('top 4:', r.topAxes.map(a => `${a.label.replace(/\n/g,' ')}(${a.pairScore.toFixed(1)})`).join(', '));
console.log('dealbreakers:', checkDealbreakers(viewer, candidate));
