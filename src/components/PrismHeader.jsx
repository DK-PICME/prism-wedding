export const PrismHeader = ({ activeNav = 'order-list' }) => {
  const navItems = [
    { id: 'photo-management', label: '사진 관리', icon: 'fa-images' },
    { id: 'order-list', label: '주문 내역', icon: 'fa-list-check' },
    { id: 'order-details', label: '주문 상세', icon: 'fa-file-invoice' },
    { id: 'settings', label: '설정', icon: 'fa-gear' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-50">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-neutral-800 to-neutral-600 rounded-lg">
              <i className="fa-solid fa-gem text-white text-lg"></i>
            </div>
            <span className="text-xl text-neutral-900">Prism Studio</span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`?page=${item.id}`}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeNav === item.id
                    ? 'text-neutral-900 bg-neutral-100'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <i className={`fa-solid ${item.icon} mr-2`}></i>
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <a href="?page=notification-center" className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors">
            <i className="fa-solid fa-bell text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-neutral-500 rounded-full"></span>
          </a>

          <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=4782"
              alt="User"
              className="w-10 h-10 rounded-full border-2 border-neutral-200"
            />
            <div className="text-sm">
              <div className="text-neutral-900">웨딩 스튜디오</div>
              <div className="text-neutral-500">wedding@example.com</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
