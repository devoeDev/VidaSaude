import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { lerSessao } from './data/portal';
import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import CadastroPerfisPage from './pages/CadastroPerfisPage';
import HomePage from './pages/HomePage';
import SaudePage from './pages/SaudePage';
import MedicamentosPage from './pages/MedicamentosPage';
import PerfilPage from './pages/PerfilPage';
import SosPage from './pages/SosPage';
import PortalPage from './pages/PortalPage';

/** Barreira visual da apresentação; não substitui autenticação de servidor. */
function ApenasIdoso({ children }: { children: ReactNode }) {
  return lerSessao().papel === 'idoso' ? <>{children}</> : <Navigate to="/portal" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />
      <Route path="/cadastro-perfis" element={<CadastroPerfisPage />} />
      <Route path="/inicio" element={<ApenasIdoso><HomePage /></ApenasIdoso>} />
      <Route path="/saude" element={<ApenasIdoso><SaudePage /></ApenasIdoso>} />
      <Route path="/saude/historico" element={<ApenasIdoso><SaudePage /></ApenasIdoso>} />
      <Route path="/saude/registrar" element={<ApenasIdoso><SaudePage /></ApenasIdoso>} />
      <Route path="/medicamentos" element={<ApenasIdoso><MedicamentosPage /></ApenasIdoso>} />
      <Route path="/horarios" element={<ApenasIdoso><MedicamentosPage /></ApenasIdoso>} />
      <Route path="/perfil" element={<ApenasIdoso><PerfilPage /></ApenasIdoso>} />
      <Route path="/sos" element={<ApenasIdoso><SosPage /></ApenasIdoso>} />
      <Route path="/portal" element={<PortalPage />} />
      <Route path="/portal/visitas" element={<PortalPage />} />
      <Route path="/portal/solicitar" element={<PortalPage />} />
      <Route path="/portal/atividades" element={<PortalPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
