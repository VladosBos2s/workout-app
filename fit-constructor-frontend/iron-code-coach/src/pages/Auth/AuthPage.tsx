import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AuthPage.module.scss';

interface AuthPageProps {
    onLoginSuccess: (email: string, role: string) => void;
}

export const AuthPage = ({ onLoginSuccess }: AuthPageProps) => {
    const { t } = useTranslation();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Handlers to clear error state when user starts typing again
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError(null);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const endPoint = isRegisterMode ? '/api/register' : '/api/login';

        try {
            const response = await fetch(`http://localhost:5000${endPoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || t('auth.defaultError'));
            }

            onLoginSuccess(data.email, data.role);
        }catch (err: any) {
    // Если бэкенд прислал известный код, переводим его через t(), иначе выводим дефолтную ошибку
   const errorCode = err.message || 'DEFAULT_ERROR';
    setError(t(`errors.${errorCode}`, { defaultValue: t('auth.defaultError') }));
}
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}> 
                <h2 className={styles.header}>
                    {isRegisterMode ? t('auth.registerTitle') : t('auth.loginTitle')}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>{t('auth.emailLabel')}</label>
                        <input 
                           type="email"
                           value={email} 
                           required 
                           onChange={handleEmailChange}
                           placeholder={t('auth.emailPlaceholder')}
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label>{t('auth.passwordLabel')}</label>
                        <input 
                           type="password"
                           value={password}
                           required
                           onChange={handlePasswordChange}
                           placeholder={t('auth.passwordPlaceholder')}
                        />
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className={styles.submitBtn}>
                        {isRegisterMode ? t('auth.registerBtn') : t('auth.loginBtn')}
                    </button>
                </form>

                <p className={styles.switchMode}>
                    {isRegisterMode ? t('auth.hasAccount') : t('auth.noAccount')}
                    <span onClick={() => setIsRegisterMode(!isRegisterMode)}>
                        {isRegisterMode ? t('auth.toLogin') : t('auth.toRegister')}
                    </span>
                </p>
           </div>
        </div>
    );
};