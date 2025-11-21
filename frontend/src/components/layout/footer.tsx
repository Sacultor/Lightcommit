export function FooterSimple() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F5F1E8] border-t border-black/10 py-8">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            © {currentYear} LightCommit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

