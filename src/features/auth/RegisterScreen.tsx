import React, { useState, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faKey } from '@fortawesome/free-solid-svg-icons';

interface RegisterScreenProps {
    switchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ switchToLogin }) => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Password and Confirm Password do not match!');
            return;
        }

        setIsLoading(true);

        try {
            // Tét Login
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (username === 'admin') {
                throw new Error('This username is already taken.');
            }

            console.log('Registration successful:', { username, email });
            alert(`Account created successfully for ${username}!`);

            switchToLogin();

        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange =
        (setter: React.Dispatch<React.SetStateAction<string>>) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setter(e.target.value);
                if (error) setError(null);
            };

    return (
        <div className="auth-form-container">
            <h2>Sign Up</h2>
            <form className="auth-form" onSubmit={handleSubmit}>

                {error && <p className="error-message">{error}</p>}

                {/* Username */}
                <div className="form-group-icon">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={handleInputChange(setUsername)}
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Email */}
                <div className="form-group-icon">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={handleInputChange(setEmail)}
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Password */}
                <div className="form-group-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={handleInputChange(setPassword)}
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Confirm Password */}
                <div className="form-group-icon">
                    <FontAwesomeIcon icon={faKey} className="input-icon" />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={handleInputChange(setConfirmPassword)}
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="auth-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                </button>
            </form>

            {/* Switch to Login */}
            <div className="signup-link-container">
                Already have an account?
                <a
                    href="#"
                    className="signup-link"
                    onClick={switchToLogin}
                >
                    Log in now
                </a>
            </div>
        </div>
    );
};

export default RegisterScreen;
