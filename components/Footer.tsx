export default function Footer() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} IoT Shop. All rights reserved.
        </p>

        <p className="text-xs">
          Built with 🖤
        </p>
      </div>
    </footer>
  );
}
