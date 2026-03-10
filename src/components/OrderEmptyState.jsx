import { useNavigate } from 'react-router-dom';

export const OrderEmptyState = ({ onCreateOrder }) => {
  const navigate = useNavigate();

  const handleCreateOrder = () => {
    if (onCreateOrder) {
      onCreateOrder();
    } else {
      navigate('/orders/new');
    }
  };

  const handleSampleRevision = () => {
    navigate('/sample-revision-request');
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="flex items-center justify-center w-32 h-32 bg-neutral-100 rounded-full mb-6">
        <i className="fa-solid fa-inbox text-neutral-400 text-6xl"></i>
      </div>

      <h2 className="text-2xl text-neutral-900 mb-3">주문 내역이 없습니다</h2>
      <p className="text-neutral-600 text-center mb-8 max-w-md">
        아직 주문하신 내역이 없습니다.<br />
        새로운 주문을 생성하여 프리즘 스튜디오의 전문 보정 서비스를 경험해보세요.
      </p>

      <button 
        onClick={handleCreateOrder}
        className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <i className="fa-solid fa-plus"></i>
        <span>새 주문 생성</span>
      </button>
    </div>
  );
};
