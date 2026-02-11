import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import TreeVisualizer from './pages/TreeVisualizer'
import GraphVisualizer from './pages/GraphVisualizer'
import FloydVisualizer from './pages/FloydVisualizer'
import HuffmanVisualizer from './pages/HuffmanVisualizer'
import CodeLab from './pages/CodeLab'
import SortingVisualizer from './pages/SortingVisualizer'
import PathfindingVisualizer from './pages/PathfindingVisualizer'
import GNDEVisualizer from './pages/GNDEVisualizer'
import DekkerVisualizer from './pages/DekkerVisualizer'
import Problems from './pages/Problems'
import ProblemSolver from './pages/ProblemSolver'

// Community pages
import CommunityHub from './pages/CommunityHub'
import ProblemLibrary from './pages/ProblemLibrary'
import SubmitProblem from './pages/SubmitProblem'
import ProblemDetail from './pages/ProblemDetail'
import Leaderboard from './pages/Leaderboard'
import UserProfile from './pages/UserProfile'
import ProfileSettings from './pages/ProfileSettings'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trees" element={<TreeVisualizer />} />
        <Route path="/graphs" element={<GraphVisualizer />} />
        <Route path="/floyd" element={<FloydVisualizer />} />
        <Route path="/huffman" element={<HuffmanVisualizer />} />
        <Route path="/sorting" element={<SortingVisualizer />} />
        <Route path="/pathfinding" element={<PathfindingVisualizer />} />
        <Route path="/gnde" element={<GNDEVisualizer />} />
        <Route path="/dekker" element={<DekkerVisualizer />} />
        <Route path="/codelab" element={<CodeLab />} />
        {/* Redirect old profile to community */}
        <Route path="/profile" element={<Navigate to="/community" replace />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problem/:id" element={<ProblemSolver />} />
        
        {/* Community Routes */}
        <Route path="/community" element={<CommunityHub />} />
        <Route path="/community/problems" element={<ProblemLibrary />} />
        <Route path="/community/submit" element={<SubmitProblem />} />
        <Route path="/community/problem/:id" element={<ProblemDetail />} />
        <Route path="/community/leaderboard" element={<Leaderboard />} />
        <Route path="/community/user/:userId" element={<UserProfile />} />
        <Route path="/community/settings" element={<ProfileSettings />} />
        <Route path="/community/admin" element={<AdminPanel />} />
      </Routes>
    </Layout>
  )
}

export default App
