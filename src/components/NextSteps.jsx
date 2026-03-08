/**
 * NextSteps - 다음 단계 안내
 */
export function NextSteps() {
  const steps = [
    {
      number: 1,
      title: '샘플 검토',
      description: '업로드하신 샘플의 보정 가능 여부를 확인합니다',
    },
    {
      number: 2,
      title: '샘플 보정 진행',
      description: '검토 완료 후 샘플 보정을 시작합니다',
    },
    {
      number: 3,
      title: '결과 확인',
      description: '보정 완료 시 비포/애프터 결과를 확인하실 수 있습니다',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-8">
      <h2 className="text-xl text-neutral-900 mb-4">다음 단계 안내</h2>
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm text-neutral-600">{step.number}</span>
            </div>
            <div>
              <h3 className="text-neutral-900 mb-1">{step.title}</h3>
              <p className="text-sm text-neutral-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
