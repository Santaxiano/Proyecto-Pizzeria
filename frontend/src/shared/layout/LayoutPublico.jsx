import Navbar from './Navbar';
import Footer from './Footer';

function LayoutPublico({ enlaces, children }) {
  return (
    <>
      <Navbar enlaces={enlaces} />
      <main style={{ minHeight: '80vh', paddingTop: '80px' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}

export default LayoutPublico;