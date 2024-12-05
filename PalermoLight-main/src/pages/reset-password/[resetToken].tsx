import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const Recover: React.FC = () => {
  const router = useRouter();
  const { resetToken } = router.query;
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reset-password/${resetToken}`,
        { newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to reset password');
      }

      // Handle successful password reset
      alert('Пароль успешно сброшен');
      router.push('/login'); // Redirect to login or another page if needed
    } catch (error: unknown) {
      console.error('Error:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Ошибка при сбросе пароля: ${error.response.data.message || 'Неизвестная ошибка'}`);
      } else {
        alert('Неизвестная ошибка при сбросе пароля'); // Fallback message
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black bg-cover bg-center">
      <div className="bg-black bg-opacity-80 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-6">PalermoLight</h1>
        <p className="text-3xl font-bold text-white text-center mb-6">Введите новый пароль</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-white">
              Новый пароль
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Новый пароль"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-black text-white border rounded-md transition duration-300 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-neutral-950 focus:ring-offset-2"
          >
            Подтверждение
          </button>
        </form>
      </div>
    </div>
  );
};

export default Recover;
