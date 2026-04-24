import LevelWrapper from './LevelWrapper'
import { TWIN_WEIGHTS } from './tasks'

export default function TwinWeights({ onComplete }) {
  return (
    <LevelWrapper
      tasks={TWIN_WEIGHTS}
      titleEn="TWIN WEIGHTS"
      titleZh="\u53CC\u5B50\u79E4"
      onComplete={onComplete}
    />
  )
}
