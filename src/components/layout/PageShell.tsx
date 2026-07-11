import React from 'react';
import Nav from './Nav';
import Footer from './Footer';

interface PageShellProps {
  children: React.ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-hprh-paper">
    <Nav />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

export default PageShell;
