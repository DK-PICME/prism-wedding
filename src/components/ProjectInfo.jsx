import { formatDateKorean, formatDateTimeKorean, statusToLabel } from '../utils/helpers';

/**
 * ProjectInfo - 프로젝트 진행 정보 표시
 */
export function ProjectInfo({ project }) {
  if (!project) return null;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-8">
      <div className="mb-6">
        <h2 className="text-xl text-neutral-900 mb-6">진행 정보</h2>

        <div className="space-y-4">
          {/* 예상 납기일 */}
          <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
            <div className="flex items-start space-x-3">
              <i className="fa-solid fa-calendar-days text-neutral-600 text-lg mt-1"></i>
              <div>
                <h3 className="text-sm text-neutral-500 mb-1">예상 납기일</h3>
                <p data-field="dueDate" className="text-lg text-neutral-900">
                  {formatDateKorean(project.dueDate)}
                </p>
              </div>
            </div>
          </div>

          {/* 진행 상태 */}
          <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
            <div className="flex items-start space-x-3">
              <i className="fa-solid fa-clock text-neutral-600 text-lg mt-1"></i>
              <div>
                <h3 className="text-sm text-neutral-500 mb-1">진행 상태</h3>
                <div className="flex items-center space-x-2">
                  <span
                    data-field="status"
                    className="px-3 py-1 bg-neutral-900 text-white text-sm rounded-full"
                  >
                    {statusToLabel(project.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 업로드 일시 */}
          {project.uploadDate && (
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <i className="fa-solid fa-upload text-neutral-600 text-lg mt-1"></i>
                <div>
                  <h3 className="text-sm text-neutral-500 mb-1">샘플 업로드 일시</h3>
                  <p data-field="uploadDate" className="text-lg text-neutral-900">
                    {formatDateTimeKorean(project.uploadDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 정보 박스 */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mt-6">
        <div className="flex items-start space-x-3">
          <i className="fa-solid fa-circle-check text-neutral-600 text-lg mt-1"></i>
          <div>
            <h3 className="text-neutral-900 mb-2">지금은 추가 업로드가 필요 없어요</h3>
            <p className="text-sm text-neutral-700">
              샘플 검토가 완료되면 결과를 확인하실 수 있습니다. 검토 완료 시 알림을 보내드릴게요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
