// src/features/auth/AuthContainer.tsx
import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

type AuthForm = 'login' | 'register';

const AuthContainer: React.FC = () => {
    const [currentForm, setCurrentForm] = useState<AuthForm>('login');

    const toggleForm = (formName: AuthForm) => {
        setCurrentForm(formName);
    };

    return (
        <div className="auth-page-container">
            {currentForm === 'login' ? (
                <LoginScreen switchToRegister={() => toggleForm('register')} />
            ) : (
                <RegisterScreen switchToLogin={() => toggleForm('login')} />
            )}
        </div>
    );
};

export default AuthContainer;