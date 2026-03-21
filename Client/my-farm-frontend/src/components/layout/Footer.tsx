
export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-transparent py-4 px-6 mt-auto border-t border-gray-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div>
                &copy; {currentYear} <span className="font-semibold text-[#2c9b4e]">Agrikon</span>. Đã đăng ký bản quyền.
            </div>
            <div className="flex gap-4 mt-2 md:mt-0">
                <a href="#" className="hover:text-[#2c9b4e] transition-colors">Chính sách bảo mật</a>
                <a href="#" className="hover:text-[#2c9b4e] transition-colors">Điều khoản sử dụng</a>
            </div>
        </footer>
    );
}