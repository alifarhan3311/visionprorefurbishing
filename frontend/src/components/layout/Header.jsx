import React, { useState } from 'react';
import TopBar from './TopBar';
import MainHeader from './MainHeader';
import MegaMenu from './MegaMenu';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header>
      <TopBar />
      <MainHeader onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <MegaMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};


export default Header;
