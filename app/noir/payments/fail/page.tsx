export default function PaymentFailPage() {
  return (
    <main className="app">
      <div className="phase screen-fade" style={{ textAlign: 'center' }}>
        <div className="phase__header">
          <h2 className="phase__title">결제가 취소되었습니다.</h2>
          <p className="phase__sub">뒤로 돌아가 다시 시도해 주세요.</p>
        </div>
      </div>
    </main>
  );
}
