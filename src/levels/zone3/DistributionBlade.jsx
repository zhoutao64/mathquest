import LevelWrapper from './LevelWrapper'
import { DISTRIBUTION_BLADE } from './tasks'

export default function DistributionBlade({ onComplete }) {
  return (
    <LevelWrapper
      tasks={DISTRIBUTION_BLADE}
      titleEn="DISTRIBUTION BLADE"
      titleZh="\u5206\u914D\u4E4B\u5203"
      onComplete={onComplete}
    />
  )
}
