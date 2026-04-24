import LevelWrapper from './LevelWrapper'
import { INEQUALITY_EDGE } from './tasks'

export default function InequalityEdge({ onComplete }) {
  return (
    <LevelWrapper
      tasks={INEQUALITY_EDGE}
      titleEn="INEQUALITY EDGE"
      titleZh="\u4E0D\u7B49\u5F0F\u8FB9\u7F18"
      onComplete={onComplete}
    />
  )
}
