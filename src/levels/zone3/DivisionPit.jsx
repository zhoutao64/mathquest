import LevelWrapper from './LevelWrapper'
import { DIVISION_PIT } from './tasks'

export default function DivisionPit({ onComplete }) {
  return (
    <LevelWrapper
      tasks={DIVISION_PIT}
      titleEn="DIVISION PIT"
      titleZh="\u9664\u6CD5\u5751\u9053"
      onComplete={onComplete}
    />
  )
}
