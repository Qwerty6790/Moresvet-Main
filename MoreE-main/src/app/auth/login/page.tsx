'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
            email,
            password,
        });

        // Сохранение токена и имени пользователя в локальном хранилище
        const token = response.data.token; // Убедитесь, что сервер возвращает токен
        localStorage.setItem('token', token); // Сохраняем токен в локальном хранилище

        // Сохранение имени пользователя в локальном состоянии или хранилище
        const username = response.data.username; // Получаем имя пользователя, если оно возвращается
        localStorage.setItem('username', username); // Сохраняем имя пользователя в локальном хранилище

        // Перенаправление пользователя
        router.push('/profile'); 

    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            // Обрабатываем ответ с ошибкой
            setError(err.response.data.error || 'Неверный email или пароль');
        } else {
            setError('Не удалось войти. Попробуйте еще раз.');
        }
        console.error(err);
    }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
  <div className="bg-white p-8 lg:mt-40 rounded shadow-md w-full max-w-md">
    <h1 className="text-5xl font-bold text-gray-800 text-center mb-6">MoreElectirki</h1>
    {error && <div className="text-red-500 mb-4">{error}</div>}
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-800">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="example@mail.com"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-800">
          Пароль
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Пароль"
          required
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <a href="/auth/reset-password" className="text-sm text-blue-600 hover:underline">
          Восстановить пароль
        </a>
        <a className="text-blue-600 underline" href="/auth/register">
          Нет аккаунта?
        </a>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded-md transition duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        Войти
      </button>
    </form>
  </div>
</div>

  );
};

export default Login;



