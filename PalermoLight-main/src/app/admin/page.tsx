'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '../../types/interfaces';
import { toast, Toaster } from 'sonner';

interface Order {
    _id: string;
    status: string[];
    products: ProductI[];
    userId: string;
}

const statusOptions = ['В обработке', 'Готов к выдаче', 'Выдан', 'Отменён'];
const correctPIN = 'pAlerRmo78&'; // Замените на ваш PIN

const Admin = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pin, setPin] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<'processed' | 'unprocessed'>('unprocessed');

    useEffect(() => {
        if (isAuthenticated) {
            const fetchOrders = async () => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/all-orders`);
                    setOrders(response.data.orders);
                } catch (error) {
                    console.error('Ошибка при загрузке заказов', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [isAuthenticated]);

    const handlePinSubmit = () => {
        if (pin === correctPIN) {
            setIsAuthenticated(true);
        } else {
            toast.error('Неверный PIN-код');
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`, { status: newStatus });
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, status: [newStatus] } : order
                )
            );
        } catch (error) {
            console.error('Ошибка при обновлении статуса', error);
        }
    };

    const updateProductStatus = async (orderId: string, article: string, newStatus: string) => {
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/products/${article}/status`, { status: newStatus });
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId
                        ? {
                              ...order,
                              products: order.products.map(product =>
                                  product.article === article ? { ...product, status: newStatus } : product
                              ),
                          }
                        : order
                )
            );
        } catch (error) {
            console.error('Ошибка при обновлении статуса товара', error);
        }
    };

    const calculateTotalPrice = (products: ProductI[]): number => {
        return products.reduce((total, product) => total + (product.price * product.quantity), 0);
    };

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Заказы, которые находятся в обработке
    const unprocessedOrders = filteredOrders.filter(order =>
        order.status.includes('В обработке')
    );

    // Заказы, которые уже обработаны (например, "Готов к выдаче" или "Выдан")
    const processedOrders = filteredOrders.filter(order =>
        order.status.includes('Готов к выдаче') || order.status.includes('Выдан')
    );

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
                <Toaster position="top-center" richColors />
                <div className="p-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-3xl shadow-2xl w-80 text-center text-white">
                    <h2 className="text-3xl font-semibold mb-4">Введите PIN-код</h2>
                    <p className="text-gray-400 mb-6 text-sm">
                        Для доступа к заказам введите ваш PIN-код
                    </p>
                    <input
                        type="password"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        className="w-full p-3 mb-4 text-center border border-gray-500 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        placeholder="PIN-код"
                    />
                    <button
                        onClick={handlePinSubmit}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none"
                    >
                        Подтвердить
                    </button>
                </div>
            </div>
        );
    }

    if (loading) return <div className="text-center text-lg text-white">Загрузка...</div>;

    return (
        <div className="max-w-6xl pt-24 mx-auto p-8 text-white bg-black rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-center mb-8">Управление заказами</h1>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={() => setSelectedTab('unprocessed')}
                    className={`px-6 py-3 mr-4 text-xl font-semibold ${selectedTab === 'unprocessed' ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg`}
                >
                    Необработанные
                </button>
                <button
                    onClick={() => setSelectedTab('processed')}
                    className={`px-6 py-3 text-xl font-semibold ${selectedTab === 'processed' ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg`}
                >
                    Обработанные
                </button>
            </div>

            {/* Search Input */}
            <input
                type="text"
                placeholder="Поиск по ID заказа"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-4 mb-6 border border-gray-600 bg-black text-white rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
            />

            {/* Orders List */}
            <h2 className="text-3xl font-semibold mb-4">
                {selectedTab === 'unprocessed' ? 'Необработанные заказы' : 'Обработанные заказы'}
            </h2>
            <ul className="space-y-6">
                {(selectedTab === 'unprocessed' ? unprocessedOrders : processedOrders).map(order => (
                    <li key={order._id} className="relative p-6 border border-neutral-800 rounded-lg bg-black shadow-md">
                        <h2 className="text-3xl font-semibold">Заказ ID: {order._id}</h2>
                        <p className="text-gray-300">Статус: {order.status.join(', ')}</p>
                        <p className="text-gray-300">
                            Общая цена: <span className="font-bold text-green-400">{calculateTotalPrice(order.products)}₽</span>
                        </p>
                        <Link href={`/users/${order.userId}`} className="absolute top-4 right-4 px-4 py-2 bg-neutral-600 text-white rounded hover:bg-neutral-700">
                            Профиль заказчика
                        </Link>
                        <select
                            className="mt-4 p-2 border border-white bg-neutral-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                            onChange={e => {
                                const newStatus = e.target.value;
                                updateOrderStatus(order._id, newStatus);
                                
                                // Если статус заказа изменился на "Готов к выдаче" или "Выдан",
                                // автоматически перенесем заказ в обработанные
                                if (newStatus === 'Готов к выдаче' || newStatus === 'Выдан') {
                                    setSelectedTab('processed'); // Переход в вкладку "Обработанные"
                                }
                            }}
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                        <h3 className="mt-4 text-lg font-semibold">Товары:</h3>
                        <ul className="space-y-3">
                            {order.products.map(product => (
                                <li key={product.article} className="flex justify-between items-center">
                                    <span>{product.name}</span>
                                    <span className="text-gray-400">{product.quantity} шт.</span>
                                    <span className="font-bold">{product.price}₽</span>
                                    <select
                                        className="p-2 mt-2 bg-neutral-500 text-white rounded"
                                        onChange={e => updateProductStatus(order._id, product.article, e.target.value)}
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Admin;
