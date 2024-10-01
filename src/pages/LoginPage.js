import React, { useState, useEffect } from 'react';
import { axiosASInstance } from '../utils/axiosConfig'; 
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const credentials = {
      username,
      password,
    };

    try {
      const response = await axiosASInstance.post('/tokens', { credentials });
      const token = response.data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('studentId', username);

      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <h2>Login - Simatricula UFCG</h2>
        <p style={styles.info}>
          Use a Matrícula/Usuário e senha do Controle Acadêmico
        </p>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Matrícula/Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Entrando...' : 'Login'}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
        <p style={styles.info}>
          Esta aplicação utiliza uma API oficial da UFCG para garantir a autenticidade e segurança dos dados.
        </p>
      </div>
    </div>
  );
}

const styles = {
  background: {
    backgroundColor: '#f0f4f8',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#d6eaf8',
    alignItems: 'center',
    padding: '0', 
    margin: '0',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    padding: '2rem',
    backgroundColor: '#ffffffdd',
    borderRadius: '0.5rem',
    boxShadow: '0 0 1rem rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    marginBottom: '1rem',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '0.25rem',
    border: '1px solid #ddd',
    boxShadow: '0 0 0.5rem rgba(0,0,0,0.05)',
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '0.25rem',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 0 0.5rem rgba(0,0,0,0.1)',
  },
  error: {
    color: 'red',
    marginTop: '1rem',
  },
  info: {
    fontSize: '0.875rem',
    color: '#555',
    marginBottom: '1.25rem',
  },
};

export default LoginPage;
