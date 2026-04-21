import { Routes, Route } from 'react-router-dom'
import Home from './screens/Home'
import CharacterSelect from './screens/CharacterSelect'
import WorldMap from './screens/WorldMap'
import ZoneMap from './screens/ZoneMap'
import LevelPlay from './screens/LevelPlay'
import LevelResult from './screens/LevelResult'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/character" element={<CharacterSelect />} />
      <Route path="/map" element={<WorldMap />} />
      <Route path="/zone/:zoneId" element={<ZoneMap />} />
      <Route path="/zone/:zoneId/level/:levelId" element={<LevelPlay />} />
      <Route path="/zone/:zoneId/level/:levelId/result" element={<LevelResult />} />
    </Routes>
  )
}
