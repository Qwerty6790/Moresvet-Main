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
    <div className="flex items-center justify-center min-h-screen bg-white">
        <h1 className="text-2xl md:text-6xl font-extrabold text-neutral-900 mb-2 text-left">Войти чтобы получить персональные предложения</h1>
      <div className="w-full max-w-md mt-16 bg-white rounded-xl shadow-sm p-8">
      
      <h2 className="text-center font-bold text-3xl text-black  mb-6">Для дизайнеров</h2>
        {error && (
          <div className="text-red-600 mb-4 text-sm font-medium text-left">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="example@mail.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Пароль"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <a href="/auth/register" className="text-black hover:underline">Нет аккаунта?</a>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-900 transition-colors"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;



