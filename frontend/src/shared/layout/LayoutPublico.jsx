import { Outlet } from 'react-router';
import Navbar from './Navbar';
import Footer from './Footer';

function LayoutPublico() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', paddingTop: '80px' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default LayoutPublico;