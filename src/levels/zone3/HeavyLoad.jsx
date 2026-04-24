import LevelWrapper from './LevelWrapper'
import { HEAVY_LOAD } from './tasks'

export default function HeavyLoad({ onComplete }) {
  return (
    <LevelWrapper
      tasks={HEAVY_LOAD}
      titleEn="HEAVY LOAD"
      titleZh="\u6EE1\u8F7D\u77FF\u8F66"
      onComplete={onComplete}
    />
  )
}
