import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const ServiceIntroPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col">
      <PrismHeader activeNav="service-intro" />

      <main className="flex-1 pt-[73px] pb-8">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">서비스 소개</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
              Prism Studio는 전문 웨딩 사진 보정 서비스를 제공합니다.
              고객의 소중한 순간을 더욱 아름답게 만들어드립니다.
            </p>
          </div>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
