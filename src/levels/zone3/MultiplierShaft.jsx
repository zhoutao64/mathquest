import LevelWrapper from './LevelWrapper'
import { MULTIPLIER_SHAFT } from './tasks'

export default function MultiplierShaft({ onComplete }) {
  return (
    <LevelWrapper
      tasks={MULTIPLIER_SHAFT}
      titleEn="MULTIPLIER SHAFT"
      titleZh="\u4E58\u6CD5\u77FF\u5751"
      onComplete={onComplete}
    />
  )
}
