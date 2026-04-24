import LevelWrapper from './LevelWrapper'
import { TWIN_MINES } from './tasks'

export default function TwinMines({ onComplete }) {
  return (
    <LevelWrapper
      tasks={TWIN_MINES}
      titleEn="TWIN MINES"
      titleZh="\u53CC\u5B50\u77FF\u4E95"
      onComplete={onComplete}
    />
  )
}
