import {  useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { ResultsDisplay } from "./Features/Calculator/components/ResultsDisplay/ResultsDisplay";
import { UserForm } from "./Features/Calculator/components/UserForm/UserForm";
import { useCalculator } from "./Features/Calculator/hooks/useCalculator";
import { ExercisesPage } from "./pages/Exercises/ExercisesPage";
import { PlansPage } from "./pages/Plans/PlansPage";
import { MainPage } from "./pages/Main/MainPage"; // Импортируем Главную
import { AuthPage } from "./pages/Auth/AuthPage"; // Импортируем Авторизацию
import type { SplitType } from "./shared/types";
import styles from "./App.module.scss";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import "./i18n/i18n";
import { useTranslation } from 'react-i18next';
import { AdminPage } from "./pages/Admin/AdminPage/AdminPage";
export const App = () => {
  const { stats, setStats, result, handleCalculate } = useCalculator();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate(); // Нужен для редиректов (например, после логина)

  // 
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [selectedSplit, setSelectedSplit] = useState<SplitType | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>("user")

  const isAuth = Boolean(currentUserEmail);
  const isAdmin = currentUserRole === 'admin'
  

  const handleSubmit = () => {
    handleCalculate();
    setIsModalOpen(true);
  };

  const handleLoginSuccess = (email: string, role: string) => {
    setCurrentUserEmail(email);
    setCurrentUserRole(role || "user");
    navigate('/profile');
  };

  const handleLogout = () => {
  setCurrentUserEmail('');
  navigate('/');
  };
 
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

 const currentLang = i18n.language;



  return (
    <div>
      {/* Навигация */}
      <nav className={styles.nav}>
        <NavLink to="/" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>{t('nav.home')}</NavLink>
        <NavLink to="/calculator" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>{t('nav.calculator')}</NavLink>
        <NavLink to="/exercises" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>{t('nav.exercises')}</NavLink>
        <NavLink to="/plans" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>{t('nav.plans')}</NavLink>
        <NavLink to="/profile" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>{t('nav.profile')}</NavLink>
         {/* Кнопки переключения языка вставляем прямо сюда, например, в шапку */}
   
        
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} style={{ color: '#ff4d4d', fontWeight: 'bold' }}>
            👑 {t('nav.admin')}
          </NavLink>
        )}
        <div className={styles.switcherContainer}>
      <button 
        className={`${styles.langBtn} ${currentLang === 'ru' ? styles.active : ''}`}
        onClick={() => changeLanguage('ru')}
      >
        RU
      </button>
      <button 
        className={`${styles.langBtn} ${currentLang === 'en' ? styles.active : ''}`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
    </div>
        {/* Кнопка Входа/Выхода в конце навигации */}
        {isAuth ? (
          <button onClick={handleLogout} className={styles.authBtn}>{t('nav.logout')}</button>
        ) : (
          <NavLink to="/auth" className={({ isActive }) => `${styles.navLink} ${styles.authBtn} ${isActive ? styles.active : ''}`}>{t('nav.login')}</NavLink>
        )}
      </nav>

      <Routes>
        {/* 1. ГЛАВНАЯ СТРАНИЦА */}
        <Route path="/" element={<MainPage onStart={() => navigate('/calculator')} />} />

        {/* 2. СТРАНИЦА АВТОРИЗАЦИИ */}
        <Route path="/auth" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />

        {/* 3. ТВОЙ КАЛЬКУЛЯТОР (Переехал на /calculator) */}
        <Route path="/calculator" element={
          <div style={{ padding: '2rem' }}>
            <UserForm
              stats={stats}
              userEmail={currentUserEmail}
              onChange={setStats}
              onSubmit={handleSubmit}
            />
            {isModalOpen && result && (
              <div className={styles.overlay} onClick={() => setIsModalOpen(false)}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                  <ResultsDisplay 
                    calories={result.calories} 
                    protein={result.protein}
                    carbs={result.carbs}
                    fats={result.fats}
                    splits={result.splits} 
                    selectedSplit={selectedSplit}       
                    onSplitSelect={(split) => {
                      setSelectedSplit(split);
                      localStorage.setItem('user_selected_split', split);
                    }}    
                  />
                  <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                    Закрыть
                  </button>
                </div>
              </div>
            )}
          </div>
        } />

        {/* 4. УПРАЖНЕНИЯ */}
        <Route path="/exercises" element={
          <ExercisesPage
            userLevel={stats.experienceLevel}
            userSplit={result?.splits[0] ?? 'full-body'}
          />
        } />

        {/* 5. ПЛАНЫ */}
        <Route path="/plans" element={
          <PlansPage
            userEmail={currentUserEmail}  
            userSplit={selectedSplit ?? result?.splits[0] ?? 'full-body'}
            trainingsPerWeek={stats.trainingsPerWeek}
            userLevel={stats.experienceLevel}
          />
        } />
         {/* 6 ПРОФИЛЬ */}
         <Route path="/profile" element ={
          <ProfilePage 
          userEmail={currentUserEmail} 
        stats={stats} 
        result={result} 
       onLogout={handleLogout}
      />
         }/>
          {/* Админ-панель*/}
         <Route path="/admin" element={
          isAdmin ? (
           <AdminPage adminEmail={currentUserEmail}/>
          ) : (
            <div style={{ padding: '2rem', color: 'red' }}>
              <h2>Доступ запрещен</h2>
              <p>У вас нет прав администратора для просмотра этой страницы.</p>
            </div>
          )
        } />
      </Routes>
    
    </div>
  );
}
