import { Routes, Route } from 'react-router-dom';
import { ModeProvider } from './chrome/ModeContext';
import PillNav from './chrome/PillNav';
import Toast from './chrome/Toast';
import Vanilla from './modes/vanilla/Vanilla';
import Tech from './modes/tech/Tech';
import Finance from './modes/finance/Finance';
import Life from './modes/life/Life';

export default function App() {
  return (
    <ModeProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <PillNav />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Vanilla />} />
          <Route path="/tech" element={<Tech />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/life" element={<Life />} />
          <Route path="*" element={<Vanilla />} />
        </Routes>
      </main>
      <Toast />
    </ModeProvider>
  );
}
