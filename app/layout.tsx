import './globals.css';
import { Inter } from 'next/font/google';
import ClientWrappers from './components/ClientWrappers';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <ClientWrappers />
        <main className="pt-16">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 py-8 mt-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600">
                  © {new Date().getFullYear()} Hedera Stock Trader. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-4">
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Terms</a>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Privacy</a>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Support</a>
                <a href="/dev/image-generator" className="text-sm text-blue-500 hover:text-blue-700">Image Generator</a>
              </div>
            </div>
            <div className="mt-4 text-xs text-center text-gray-500">
              <p>Demo application for educational purposes. Not financial advice.</p>
              <p className="mt-1">Powered by Hedera DLT. Stock data is simulated for demonstration.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
