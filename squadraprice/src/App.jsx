import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
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
      <Route path="/" element={<Home />} />
      <Route path="/Usuarios" element={<Usuarios />} />
      <Route path="/Constantes" element={<Constantes />} />
      <Route path="/Cidades" element={<Cidades />} />
      <Route path="/CidadesEstados" element={<Cidades />} />
      <Route path="/Estados" element={<Estados />} />
      <Route path="/Produtos" element={<Produtos />} />
      <Route path="/Insumos" element={<Insumos />} />
      <Route path="/Vidros" element={<Vidros />} />
      <Route path="/Orcamentos" element={<Orcamentos />} />
      <Route path="/Orcamentos/:id" element={<OrcamentoDetalhes />} />
      <Route path="/Orcamentos/:id/memorial" element={<OrcamentoMemorial />} />
      <Route path="/Orcamentos/:id/print" element={<OrcamentoPrint />} />
      <Route path="/Orcamentos/:id/precificacao" element={<OrcamentoPrecificacaoPrint />} />
      <Route path="/PedidoOrcamento" element={<PedidoOrcamento />} />
      <Route path="/CriarOrcamento" element={<CriarOrcamento />} />
      <Route path="/ModeloOrcamento" element={<ModeloOrcamento />} />
      <Route path="/Fornecedores" element={<Fornecedores />} />
      <Route path="/CoresAluminio" element={<CoresAluminio />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}

export default App
