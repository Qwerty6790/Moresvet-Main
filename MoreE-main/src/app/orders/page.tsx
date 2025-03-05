'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import { OrderI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
import { FiShoppingBag, FiXCircle } from 'react-icons/fi';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderI[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        // Запрос всех заказов
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setOrders(response.data.orders);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error instanceof AxiosError && error.response?.status === 403) {
          toast.error('Пожалуйста, войдите в аккаунт.');
          localStorage.removeItem('token');
        } else {
          toast.error('Ошибка при загрузке заказов');
          console.error(error);
        }
      }
    };

    fetchOrders();
  }, []);

  const handleOpenModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${selectedOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setOrders((prevOrders) => prevOrders.filter(order => order._id !== selectedOrderId));
      toast.success('Заказ успешно отменен');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 403) {
        toast.error('Пожалуйста, войдите в аккаунт снова.');
        localStorage.removeItem('token');
      } else {
        console.error(error);
        toast.error('Ошибка при отмене заказа');
      }
    } finally {
      handleCloseModal();
    }
  };

  return (
    <motion.section
      className="py-20 bg-white text-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto">
        <div className="p-4 mx-auto md:px-10 lg:px-32 xl:max-w-3xl">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Мои Заказы</h1>

          {orders.length > 0 && (
            <p className="mb-6 text-center text-gray-500">
              Нажмите на заказ ID, чтобы увидеть детали заказа. Заказы можно забрать по адресу магазина.
            </p>
          )}

          {loading ? (
            <div className="flex justify-center items-center">
              <ClipLoader color="#000" size={50} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-600">У вас еще нет заказов.</div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  className="relative bg-white border border-gray-200 rounded-lg shadow-md p-6 transform transition-all duration-300 hover:shadow-lg hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FiShoppingBag className="text-lg text-gray-500 mr-2" />
                      <Link href={`/orders/${order._id}`} className="text-lg font-semibold text-gray-900 hover:underline">
                        Заказ ID: {order._id}
                      </Link>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(order._id);
                      }}
                    >
                      <FiXCircle className="text-xl" />
                    </button>
                  </div>
                  <p className="text-gray-600">Общая сумма: {order.totalAmount} ₽</p>
                  <p className="text-gray-600">Статус: {order.status}</p>
                </motion.div>
              ))}
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Подтверждение отмены</h2>
                <p className="text-gray-700">Вы уверены, что хотите отменить этот заказ?</p>
                <div className="flex justify-end mt-4">
                  <button className="px-4 py-2 mr-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={handleCloseModal}>
                    Отмена
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={handleCancelOrder}>
                    Подтвердить
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default Orders;
