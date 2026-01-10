import React, { useState, FormEvent, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faCheckCircle } from "@fortawesome/free-solid-svg-icons"; // Thêm icon check
import { connectSocket, sendSocket } from "../../api/socket";

interface RegisterScreenProps {
    switchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ switchToLogin }) => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // State thông báo và đếm ngược
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number>(5);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        let interval: NodeJS.Timeout;

        const handleSuccess = (e: any) => {
            setIsLoading(false);
            setError(null);
            setSuccessMsg("Đăng ký tài khoản thành công!");

            // Bắt đầu đếm ngược từ 5 giây
            let seconds = 3;
            interval = setInterval(() => {
                seconds -= 1;
                setCountdown(seconds);
                if (seconds <= 0) clearInterval(interval);
            }, 1000);

            // Chuyển màn hình sau 5 giây
            timer = setTimeout(() => {
                switchToLogin();
            }, 3000);
        };

        const handleError = (e: any) => {
            setIsLoading(false);
            setError(e.detail || "Đăng ký thất bại, vui lòng thử lại.");
            setSuccessMsg(null);
        };

        window.addEventListener("register-success", handleSuccess);
        window.addEventListener("register-error", handleError);

        return () => {
            window.removeEventListener("register-success", handleSuccess);
            window.removeEventListener("register-error", handleError);
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [switchToLogin]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        connectSocket(() => {
            sendSocket({
                action: "onchat",
                data: {
                    event: "REGISTER",
                    data: { user: username, pass: password },
                },
            });
        });
    };

    return (
        <div className="auth-form-container">
            <h2>Đăng Ký Tài Khoản</h2>

            {/* Hiển thị thông báo thành công và đếm ngược */}
            {successMsg && (
                <div className="success-alert" style={{
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    padding: "15px",
                    borderRadius: "5px",
                    marginBottom: "20px",
                    textAlign: "center",
                    border: "1px solid #c3e6cb"
                }}>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: "10px" }} />
                    <strong>{successMsg}</strong>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>
                        Tự động chuyển sang đăng nhập sau <b>{countdown}s</b>...
                    </p>
                </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
                {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                <div className="form-group-icon">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    <input
                        type="text"
                        placeholder="Tên Tài Khoản"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isLoading || !!successMsg}
                    />
                </div>

                <div className="form-group-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                        type="password"
                        placeholder="Mật Khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading || !!successMsg}
                    />
                </div>

                <button type="submit" className="auth-button" disabled={isLoading || !!successMsg}>
                    {isLoading ? "ĐANG XỬ LÝ..." : "Đăng Ký"}
                </button>
            </form>

            {!successMsg && (
                <div className="signup-link-container">
                    Đã Có Tài Khoản?{" "}
                    <span className="signup-link" onClick={switchToLogin} style={{ cursor: 'pointer', color: '#007bff' }}>
                        Đăng Nhập Ngay
                    </span>
                </div>
            )}
        </div>
    );
};

export default RegisterScreen;