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
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <h1 className="text-2xl md:text-7xl font-extrabold text-neutral-900 mb-4 text-left">
          Создать аккаунт если ты дизайнер или архитектор
        </h1>
      <div className="w-full max-w-md mt-16 bg-white rounded-xl  shadow-sm p-8">
        

        <h2 className="text-center font-bold text-3xl text-black  mb-6">Зарегистрироваться</h2>

        {error && (
          <div className="text-red-600 mb-4 text-center text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Поле для имени пользователя */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">Имя пользователя</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Введите имя"
              required
            />
          </div>
  
          {/* Поле для email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="you@example.com"
              required
            />
          </div>
  
          {/* Поле для пароля */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Придумайте надёжный пароль"
              required
            />
          </div>
  
          <div className="flex justify-between items-center mt-2 text-sm">
            <a href="/auth/login" className="text-black hover:underline">Уже есть аккаунт?</a>
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-3 bg-black text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-900 transition-colors"
          >
            Создать аккаунт
          </button>
        </form>
      </div>
    </div>
  
  

  );
};

export default Register;
