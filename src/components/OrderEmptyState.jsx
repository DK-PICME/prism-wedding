import { useNavigate } from 'react-router-dom';

export const OrderEmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
      <div className="flex flex-col items-center justify-center py-20 lg:py-32 px-6">
        <div className="flex items-center justify-center w-24 h-24 bg-neutral-100 rounded-full mb-6">
          <i className="fa-solid fa-inbox text-neutral-400 text-5xl"></i>
        </div>

        <h2 className="text-2xl text-neutral-900 mb-3 text-center font-semibold">
          아직 주문이 없습니다
        </h2>
        <p className="text-neutral-600 text-center mb-8 max-w-md">
          첫 번째 보정 주문을 시작해보세요.
          <br />
          사진을 업로드하고 보정 요구사항만 입력하면
          <br />
          빠르게 작업을 시작할 수 있습니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => navigate('/orders/new')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 rounded-xl transition-colors font-medium"
          >
            <i className="fa-solid fa-plus"></i>
            첫 주문 생성하기
          </button>

          <button
            onClick={() => navigate('/sample-revision-request')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-8 py-4 rounded-xl transition-colors font-medium"
          >
            <i className="fa-solid fa-book"></i>
            샘플 보정 요청
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-xl mb-4">
              <i className="fa-solid fa-upload text-neutral-600 text-2xl"></i>
            </div>
            <h3 className="text-neutral-900 mb-2 font-semibold">사진 업로드</h3>
            <p className="text-sm text-neutral-600">보정이 필요한 사진을 업로드하세요</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-xl mb-4">
              <i className="fa-solid fa-pen-to-square text-neutral-600 text-2xl"></i>
            </div>
            <h3 className="text-neutral-900 mb-2 font-semibold">요구사항 입력</h3>
            <p className="text-sm text-neutral-600">원하는 보정 스타일을 선택하세요</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-xl mb-4">
              <i className="fa-solid fa-check-circle text-neutral-600 text-2xl"></i>
            </div>
            <h3 className="text-neutral-900 mb-2 font-semibold">주문 완료</h3>
            <p className="text-sm text-neutral-600">결제 후 작업이 시작됩니다</p>
          </div>
        </div>
      </div>
    </div>
  );
};
