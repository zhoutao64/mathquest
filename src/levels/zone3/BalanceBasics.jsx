import LevelWrapper from './LevelWrapper'
import MineShaftTutorial from './MineShaftTutorial'
import { BALANCE_BASICS } from './tasks'

export default function BalanceBasics({ onComplete }) {
  return (
    <LevelWrapper
      tasks={BALANCE_BASICS}
      titleEn="BALANCE BASICS"
      titleZh="\u5E73\u8861\u57FA\u7840"
      Tutorial={MineShaftTutorial}
      onComplete={onComplete}
    />
  )
}
