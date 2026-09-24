import React, { useState } from 'react';
import { playButtonClickSound, playBrewCompleteSound } from '../utils/soundEffects';

export default function AuthModal({ isOpen, onClose, isDark, onLogin }) {
  const [mode, setMode] = useState('register'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    day: '1',
    month: '1',
    year: '2005',
    terms: false,
    remember: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('Паролі не співпадають!');
        return;
      }
      if (!formData.terms) {
        setErrorMsg('Необхідно погодитися з Умовами використання!');
        return;
      }
    }

    playBrewCompleteSound();
    setSubmitted(true);

    const userProfile = {
      username: formData.username.trim() || formData.email.split('@')[0] || 'Алхімік',
      email: formData.email,
    };

    if (onLogin) {
      onLogin(userProfile);
    }

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`auth-modal-content ${isDark ? 'dark-theme' : 'light-theme'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={() => {
            playButtonClickSound();
            onClose();
          }}
        >
          ✕
        </button>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              playButtonClickSound();
              setMode('register');
              setErrorMsg('');
            }}
          >
            📝 Реєстрація
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              playButtonClickSound();
              setMode('login');
              setErrorMsg('');
            }}
          >
            🔑 Увійти
          </button>
        </div>

        <h2 className="pixel-title auth-title">
          {mode === 'register' ? '👤 Реєстрація Алхіміка' : '🔑 Вхід до кабінету'}
        </h2>
        <p className="auth-subtitle">
          {mode === 'register'
            ? 'Будь ласка, заповніть форму нижче, щоб зареєструвати обліковий запис.'
            : 'Введіть ваші дані для входу до облікового запису.'}
        </p>

        {submitted ? (
          <div className="auth-success-msg">
            ✅ {mode === 'register' ? 'Успішно зареєстровано!' : 'Успішний вхід!'} Ласкаво просимо,{' '}
            {formData.username || 'Алхіміку'}!
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {errorMsg && <div className="auth-error-badge">⚠️ {errorMsg}</div>}

            <div className="input-group">
              <label>Ім'я користувача:</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Steve / Alex"
              />
            </div>

            {mode === 'register' && (
              <div className="input-group">
                <label>Електронна пошта:</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="alchemist@minecraft.net"
                />
              </div>
            )}

            <div className="input-group">
              <label>Пароль:</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
              />
            </div>

            {mode === 'register' && (
              <div className="input-group">
                <label>Підтвердження пароля:</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
            )}

            {mode === 'register' && (
              <div className="birth-date-group">
                <label>Вік (Дата народження):</label>
                <div className="birth-selects">
                  <div className="birth-select-wrap">
                    <span>День:</span>
                    <select
                      value={formData.day}
                      onChange={(e) =>
                        setFormData({ ...formData, day: e.target.value })
                      }
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="birth-select-wrap">
                    <span>Місяць:</span>
                    <select
                      value={formData.month}
                      onChange={(e) =>
                        setFormData({ ...formData, month: e.target.value })
                      }
                    >
                      {[
                        'Січень',
                        'Лютий',
                        'Березень',
                        'Квітень',
                        'Травень',
                        'Червень',
                        'Липень',
                        'Серпень',
                        'Вересень',
                        'Жовтень',
                        'Листопад',
                        'Грудень',
                      ].map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="birth-select-wrap">
                    <span>Рік:</span>
                    <select
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                    >
                      {Array.from({ length: 72 }, (_, i) => 2026 - i).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {mode === 'register' ? (
              <div className="terms-checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.terms}
                    onChange={(e) =>
                      setFormData({ ...formData, terms: e.target.checked })
                    }
                    required
                  />
                  <span>
                    Я погоджуюсь з{' '}
                    <span className="terms-link">Умовами використання</span> та правилами Алхімії
                  </span>
                </label>
              </div>
            ) : (
              <div className="terms-checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) =>
                      setFormData({ ...formData, remember: e.target.checked })
                    }
                  />
                  <span>Запам'ятати мене</span>
                </label>
              </div>
            )}

            <button type="submit" className="pixel-btn auth-submit-btn">
              {mode === 'register' ? 'Зареєструватися' : 'Увійти'}
            </button>

            <div className="auth-switch-prompt">
              {mode === 'register' ? (
                <p>
                  Вже маєте обліковий запис?{' '}
                  <button
                    type="button"
                    className="auth-inline-link"
                    onClick={() => {
                      playButtonClickSound();
                      setMode('login');
                      setErrorMsg('');
                    }}
                  >
                    Увійти
                  </button>
                </p>
              ) : (
                <p>
                  Ще немає облікового запису?{' '}
                  <button
                    type="button"
                    className="auth-inline-link"
                    onClick={() => {
                      playButtonClickSound();
                      setMode('register');
                      setErrorMsg('');
                    }}
                  >
                    Зареєструватися
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}