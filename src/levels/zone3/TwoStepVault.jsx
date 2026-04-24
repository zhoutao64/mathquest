import LevelWrapper from './LevelWrapper'
import { TWO_STEP_VAULT } from './tasks'

export default function TwoStepVault({ onComplete }) {
  return (
    <LevelWrapper
      tasks={TWO_STEP_VAULT}
      titleEn="TWO-STEP VAULT"
      titleZh="\u4E24\u6B65\u4FDD\u9669\u5E93"
      onComplete={onComplete}
    />
  )
}
