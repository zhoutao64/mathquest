import LevelWrapper from './LevelWrapper'
import { FRACTION_FORGE } from './tasks'

export default function FractionForge({ onComplete }) {
  return (
    <LevelWrapper
      tasks={FRACTION_FORGE}
      titleEn="FRACTION FORGE"
      titleZh="\u5206\u6570\u953B\u9020"
      onComplete={onComplete}
    />
  )
}
