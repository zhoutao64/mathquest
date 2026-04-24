import LevelWrapper from './LevelWrapper'
import { NEGATIVE_CAVE } from './tasks'

export default function NegativeCave({ onComplete }) {
  return (
    <LevelWrapper
      tasks={NEGATIVE_CAVE}
      titleEn="NEGATIVE CAVE"
      titleZh="\u8D1F\u6570\u6D1E\u7A9F"
      onComplete={onComplete}
    />
  )
}
