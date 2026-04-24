import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'
import useSettingsStore from '../store/useSettingsStore'

export default function SettingsPanel({ onClose, showExit = false }) {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const toggleLanguage = useSettingsStore((s) => s.toggleLanguage)
  const devMode = useSettingsStore((s) => s.devMode)
  const toggleDevMode = useSettingsStore((s) => s.toggleDevMode)
  const resetGame = useGameStore((s) => s.reset)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleToggleLang = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en'
    i18n.changeLanguage(nextLang)
    toggleLanguage()
  }

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    resetGame()
    localStorage.removeItem('mathquest-progress')
    localStorage.removeItem('mathquest-settings')
    window.location.reload()
  }

  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fade-in 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 24,
          padding: '28px 24px',
          maxWidth: 340,
          width: '90%',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          animation: 'bounce-in 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1E293B' }}>
            {lang === 'zh' ? '\u2699\uFE0F \u8BBE\u7F6E' : '\u2699\uFE0F Settings'}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: 'none', background: 'rgba(0,0,0,0.05)',
              fontSize: 16, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#64748B',
            }}
          >
            {'\u2715'}
          </button>
        </div>

        {/* Language toggle */}
        <div
          onClick={handleToggleLang}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', background: 'rgba(78, 205, 196, 0.08)',
            borderRadius: 16, cursor: 'pointer', marginBottom: 12,
            border: '1px solid rgba(78, 205, 196, 0.15)',
            transition: 'background 0.2s',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>
              {lang === 'zh' ? '\uD83C\uDF10 \u8BED\u8A00' : '\uD83C\uDF10 Language'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>
              {lang === 'zh' ? '\u5207\u6362\u4E2D/\u82F1\u6587' : 'Switch Chinese/English'}
            </div>
          </div>
          <div style={{
            background: '#4ECDC4', color: 'white', padding: '4px 12px',
            borderRadius: 12, fontSize: '0.85rem', fontWeight: 700,
          }}>
            {lang === 'zh' ? 'EN' : '\u4E2D'}
          </div>
        </div>

        {/* Dev mode toggle */}
        <div
          onClick={toggleDevMode}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: devMode ? 'rgba(255, 184, 0, 0.1)' : 'rgba(100, 116, 139, 0.05)',
            borderRadius: 16, cursor: 'pointer', marginBottom: 12,
            border: devMode ? '1px solid rgba(255, 184, 0, 0.25)' : '1px solid rgba(100, 116, 139, 0.1)',
            transition: 'all 0.2s',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>
              {lang === 'zh' ? '\uD83D\uDD13 \u5F00\u53D1\u6A21\u5F0F' : '\uD83D\uDD13 Dev Mode'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>
              {lang === 'zh' ? '\u89E3\u9501\u6240\u6709\u5173\u5361' : 'Unlock all levels'}
            </div>
          </div>
          <div style={{
            background: devMode ? '#FFB800' : '#CBD5E1',
            color: 'white', padding: '4px 12px',
            borderRadius: 12, fontSize: '0.85rem', fontWeight: 700,
            transition: 'background 0.2s',
          }}>
            {devMode ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* Reset button */}
        <div
          onClick={handleReset}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: confirmReset ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.05)',
            borderRadius: 16, cursor: 'pointer',
            border: confirmReset ? '1px solid rgba(255, 107, 107, 0.3)' : '1px solid rgba(255, 107, 107, 0.1)',
            transition: 'all 0.2s',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: confirmReset ? '#FF6B6B' : '#1E293B' }}>
              {confirmReset
                ? (lang === 'zh' ? '\u26A0\uFE0F \u786E\u8BA4\u91CD\u7F6E\uFF1F' : '\u26A0\uFE0F Confirm reset?')
                : (lang === 'zh' ? '\uD83D\uDD04 \u91CD\u65B0\u5F00\u59CB' : '\uD83D\uDD04 Reset Progress')
              }
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>
              {confirmReset
                ? (lang === 'zh' ? '\u70B9\u51FB\u786E\u8BA4\u6E05\u9664\u6240\u6709\u8FDB\u5EA6' : 'Click to confirm clearing all data')
                : (lang === 'zh' ? '\u6E05\u9664\u6240\u6709\u8FDB\u5EA6\u548C\u7F13\u5B58' : 'Clear all progress and cache')
              }
            </div>
          </div>
          <div style={{
            background: confirmReset ? '#FF6B6B' : '#94A3B8',
            color: 'white', padding: '4px 12px',
            borderRadius: 12, fontSize: '0.85rem', fontWeight: 700,
          }}>
            {confirmReset
              ? (lang === 'zh' ? '\u786E\u8BA4' : 'Yes')
              : (lang === 'zh' ? '\u91CD\u7F6E' : 'Reset')
            }
          </div>
        </div>

        {/* Exit button — navigate back to home */}
        {showExit && (
          <div
            onClick={() => { onClose(); navigate('/') }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', background: 'rgba(100, 116, 139, 0.05)',
              borderRadius: 16, cursor: 'pointer', marginTop: 12,
              border: '1px solid rgba(100, 116, 139, 0.1)',
              transition: 'background 0.2s',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>
                {lang === 'zh' ? '\uD83D\uDEAA \u9000\u51FA' : '\uD83D\uDEAA Exit'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>
                {lang === 'zh' ? '\u8FD4\u56DE\u4E3B\u9875' : 'Back to home'}
              </div>
            </div>
            <div style={{ color: '#64748B', fontSize: '1.2rem' }}>
              {'\u2192'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Reusable settings gear button
export function SettingsGearButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: '50%',
        width: 44,
        height: 44,
        fontSize: 22,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        transition: 'transform 0.3s ease',
        zIndex: 10,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(90deg)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(0deg)')}
    >
      {'\u2699\uFE0F'}
    </button>
  )
}
