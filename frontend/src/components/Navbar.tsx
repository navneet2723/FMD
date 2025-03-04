import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed w-full z-20 top-0 left-0 border-b border-gray-200 bg-white">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3">
          <span className="self-center text-2xl font-semibold whitespace-nowrap">EMAN ON</span>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;