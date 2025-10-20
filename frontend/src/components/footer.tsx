export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-800 py-8">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} LightCommit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

