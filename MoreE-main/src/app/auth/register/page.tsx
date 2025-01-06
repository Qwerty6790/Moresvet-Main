'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Register: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
            username,
            email,
            password,
        });
        
        // Сохранение токена и имени пользователя в локальном хранилище
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', username); // Сохраняем имя пользователя
        
        router.push('/profile');

    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            // Обрабатываем ответ с ошибкой
            setError(err.response.data.error || 'Регистрация не удалась. Попробуйте снова.');
        } else {
            setError('Регистрация не удалась. Попробуйте снова.');
        }
        console.error(err);
    }
  };

  return (
    <div className="min-h-screen px-6 py-52">
  <div className="bg-white py-12 px-8 lg:py-16 lg:px-24 rounded mx-auto max-w-screen-lg">
    <h1 className="text-5xl font-bold text-gray-800 mb-10 text-left">
      Авторизуйтесь в MoreElectriki
    </h1>
    {error && <div className="text-red-500 mb-6 text-lg">{error}</div>} {/* Сообщение об ошибке */}

    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <label htmlFor="username" className="block text-lg font-medium text-gray-800 mb-2">
            Имя пользователя
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Введите имя пользователя"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-lg font-medium text-gray-800 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="example@mail.com"
            required
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="password" className="block text-lg font-medium text-gray-800 mb-2">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Введите пароль"
            required
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <a href="/auth/reset-password" className="text-lg text-blue-600 hover:underline">
          Восстановить пароль
        </a>
        <a href="/auth/login" className="text-lg text-blue-600 hover:underline">
          Уже есть аккаунт? Войдите
        </a>
      </div>

      <button
        type="submit"
        className="mt-8 w-full py-4 bg-blue-500 text-white text-xl font-bold rounded-md transition duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        Зарегистрироваться
      </button>
    </form>
  </div>
</div>


  );
};

export default Register;
