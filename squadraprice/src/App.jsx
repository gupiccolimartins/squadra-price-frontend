import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import PrivateRoute from './components/PrivateRoute'
import Usuarios from './components/Usuarios'
import Constantes from './components/Constantes'
import Cidades from './components/Cidades'
import Estados from './components/Estados'
import Produtos from './components/Produtos'
import Insumos from './components/Insumos'
import Vidros from './components/Vidros'
import Orcamentos from './components/Orcamentos'
import OrcamentoDetalhes from './components/OrcamentoDetalhes'
import OrcamentoMemorial from './components/OrcamentoMemorial'
import OrcamentoPrint from './components/OrcamentoPrint'
import OrcamentoPrecificacaoPrint from './components/OrcamentoPrecificacaoPrint'
import PedidoOrcamento from './components/PedidoOrcamento'
import ModeloOrcamento from './components/ModeloOrcamento'
import CriarOrcamento from './components/CriarOrcamento'
import Fornecedores from './components/Fornecedores'
import CoresAluminio from './components/CoresAluminio'

function App() {
  return (
    <Routes>
      <Route path="/Login" element={<Login />} />
      <Route path="/PedidoOrcamento" element={<PedidoOrcamento />} />

      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />

      {/* Admin-only routes */}
      <Route path="/Usuarios" element={<PrivateRoute adminOnly><Usuarios /></PrivateRoute>} />
      <Route path="/Constantes" element={<PrivateRoute adminOnly><Constantes /></PrivateRoute>} />
      <Route path="/Cidades" element={<PrivateRoute adminOnly><Cidades /></PrivateRoute>} />
      <Route path="/CidadesEstados" element={<PrivateRoute adminOnly><Cidades /></PrivateRoute>} />
      <Route path="/Estados" element={<PrivateRoute adminOnly><Estados /></PrivateRoute>} />
      <Route path="/Produtos" element={<PrivateRoute adminOnly><Produtos /></PrivateRoute>} />
      <Route path="/Insumos" element={<PrivateRoute adminOnly><Insumos /></PrivateRoute>} />
      <Route path="/Vidros" element={<PrivateRoute adminOnly><Vidros /></PrivateRoute>} />
      <Route path="/Fornecedores" element={<PrivateRoute adminOnly><Fornecedores /></PrivateRoute>} />
      <Route path="/CoresAluminio" element={<PrivateRoute adminOnly><CoresAluminio /></PrivateRoute>} />
      <Route path="/ModeloOrcamento" element={<PrivateRoute adminOnly><ModeloOrcamento /></PrivateRoute>} />

      {/* Authenticated routes (any role) */}
      <Route path="/Orcamentos" element={<PrivateRoute><Orcamentos /></PrivateRoute>} />
      <Route path="/Orcamentos/:id" element={<PrivateRoute><OrcamentoDetalhes /></PrivateRoute>} />
      <Route path="/Orcamentos/:id/memorial" element={<PrivateRoute><OrcamentoMemorial /></PrivateRoute>} />
      <Route path="/Orcamentos/:id/print" element={<PrivateRoute><OrcamentoPrint /></PrivateRoute>} />
      <Route path="/Orcamentos/:id/precificacao" element={<PrivateRoute><OrcamentoPrecificacaoPrint /></PrivateRoute>} />
      <Route path="/CriarOrcamento" element={<PrivateRoute><CriarOrcamento /></PrivateRoute>} />

      <Route path="*" element={<PrivateRoute><Home /></PrivateRoute>} />
    </Routes>
  )
}

export default App
