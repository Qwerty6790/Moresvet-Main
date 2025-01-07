'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { ProductI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

const Cart: React.FC = () => {
  const router = useRouter();
  const [cartProducts, setCartProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const fetchCartProducts = async () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
      const storedCartCount = localStorage.getItem('cartCount');

      if (storedCartCount) {
        setCartCount(Number(storedCartCount));
      }

      if (cart.products.length > 0) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/list`,
            { products: cart.products },
            { headers: { 'Content-Type': 'application/json' } }
          );

          setCartProducts(response.data.products);
        } catch (error) {
          setError('Произошла ошибка при загрузке продуктов из корзины.');
          console.error(error);
        }
      } else {
        setError('Корзина пуста,добавьте в корзину товар для оформления!');
      }
      setIsLoading(false);
    };

    fetchCartProducts();
  }, []);

  const handleRemoveProduct = (id: string) => {
    setCartProducts((prevProducts) => {
      const updatedProducts = prevProducts
        .map((product) => {
          if (product._id === id) {
            const updatedQuantity = product.quantity - 1;
            return updatedQuantity <= 0 ? null : { ...product, quantity: updatedQuantity };
          }
          return product;
        })
        .filter((product) => product !== null) as ProductI[];

      localStorage.setItem('cart', JSON.stringify({ products: updatedProducts }));
      setCartCount(updatedProducts.length);
      localStorage.setItem('cartCount', updatedProducts.length.toString());

      toast.success('Товар удален из корзины');
      return updatedProducts;
    });
  };

  const handleIncreaseQuantity = (id: string) => {
    setCartProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((product) => {
        if (product._id === id) {
          return { ...product, quantity: product.quantity + 1 };
        }
        return product;
      });

      localStorage.setItem('cart', JSON.stringify({ products: updatedProducts }));
      setCartCount(updatedProducts.length);
      localStorage.setItem('cartCount', updatedProducts.length.toString());

      return updatedProducts;
    });
  };

  const handleDecreaseQuantity = (id: string) => {
    setCartProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((product) => {
        if (product._id === id && product.quantity > 1) {
          return { ...product, quantity: product.quantity - 1 };
        }
        return product;
      });

      localStorage.setItem('cart', JSON.stringify({ products: updatedProducts }));
      setCartCount(updatedProducts.length);
      localStorage.setItem('cartCount', updatedProducts.length.toString());

      return updatedProducts;
    });
  };

  const handleClearCart = () => {
    setCartProducts([]);
    localStorage.setItem('cart', JSON.stringify({ products: [] }));
    setCartCount(0);
    localStorage.setItem('cartCount', '0');
    setError('Корзина пуста,добавтье в корзину товар для оформления!');
    toast.success('Корзина очищена');
  };

  const handleOrder = () => {
    if (!isAuthenticated) {
      router.push('/auth/register');
      return;
    }
    setIsModalOpen(true);
  };

  const confirmOrder = async () => {
    const token = localStorage.getItem('token');
    const products = cartProducts.map((product) => ({
      name: product.name,
      article: product.article,
      source: product.source,
      quantity: product.quantity,
      price: product.price,
    }));

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/add-order`,
        { products },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );

      toast.success('Заказ успешно создан!');
      handleClearCart();
      setIsModalOpen(false);
      router.push('/orders');
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);

      if (error instanceof AxiosError && error.response?.status === 403) {
        toast.error('Пожалуйста, войдите в аккаунт заново.');
        localStorage.removeItem('token');
      } else {
        toast.error('Ошибка при создании заказа.');
      }
    }
  };

  const cancelOrder = () => {
    setIsModalOpen(false);
  };

  const totalAmount = cartProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const deliveryCost = 0;
  const totalToPay = totalAmount + deliveryCost;

  const isCartEmpty = cartProducts.length === 0;

  return (
    <motion.section
      className={`py-20 text-black ${isCartEmpty ? 'opacity-50' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Toaster position="top-center" richColors />
      
      <h1 className="text-3xl mt-20 sm:text-5xl font-bold  mx-12 mb-12 text-gray-800">
        Корзина
      </h1>
      
      <div className="container  mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Section: Cart Table */}
        <div className="lg:col-span-2 bg-white rounded-lg  p-6">
        {isLoading ? (
  <div className="flex justify-center items-center h-full">
    <ClipLoader color="#4A90E2" size={50} />
  </div>
) : error ? (
  <div className="flex flex-col items-center justify-center text-center text-3xl text-black">
    <p>{error}</p>
    <Link href="/catalog">
      <button className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        Перейти в каталог
      </button>
    </Link>
  </div>
) : (
  <div className="overflow-x-auto">
    {/* Таблица товаров */}
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="p-4 font-bold text-2xl text-black">Товар</th>
          <th className="p-4  font-bold text-2xl text-center text-black">Количество</th>
          <th className="p-4  text-2xl font-bold text-center text-black">Цена</th>
          <th className="p-4"></th>
        </tr>
      </thead>
      <tbody>
        {cartProducts.map((product) => (
          <tr key={product._id} className="">
            <td className="p-4 flex items-center space-x-4">
              <img
                src={product.imageAddress}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-md"
              />
              <Link href={`/products/${product.source}/${product.article}`}>
                <h2 className="text-sm font-semibold text-gray-800">{product.name}</h2>
              </Link>
            </td>
            <td className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleDecreaseQuantity(product._id)}
                  className="px-2 py-1 text-sm bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"
                >
                  <FaMinus />
                </button>
                <span className="text-gray-800">{product.quantity}</span>
                <button
                  onClick={() => handleIncreaseQuantity(product._id)}
                  className="px-2 py-1 text-sm bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"
                >
                  <FaPlus />
                </button>
              </div>
            </td>
            <td className="p-4 text-center">{product.price} ₽</td>
            <td className="p-4 text-center">
              <button
                onClick={() => handleRemoveProduct(product._id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
        </div>
        

        {/* Right Section: Order Summary */}
        <div className="bg-white rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Итого</h2>
            <div className="flex justify-between text-sm text-gray-600 mt-4">
              <span>Товары</span>
              <span>{totalAmount} ₽</span>
            </div>
            <div className="flex justify-between text-2xl text-black font-sans mt-2">
              <span>Доставка</span>
              <span>{deliveryCost} ₽</span>
            </div>
            <div className="flex justify-between text-2xl  font-semibold text-gray-800 mt-4">
              <span>Итого к оплате</span>
              <span>{totalToPay} ₽</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleClearCart}
              disabled={isCartEmpty}
              className={`w-full py-3 border text-2xl text-black rounded-md ${isCartEmpty ? 'opacity-50 bg-red-400 cursor-not-allowed' : 'hover:bg-red-600'}`}
            >
              Очистить корзину
            </button>
            <button
              onClick={handleOrder}
              disabled={isCartEmpty}
              className={`w-full py-3 border text-2xl text-black rounded-md ${isCartEmpty ? 'opacity-50 bg-black cursor-not-allowed' : 'hover:bg-black hover:text-white'}`}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg  p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Подтверждение заказа</h2>
            <p>Вы уверены, что хотите оформить заказ?</p>
            <div className="mt-4 space-x-4">
              <button onClick={cancelOrder} className="py-2 px-4 bg-gray-300 rounded-md hover:bg-gray-400">Отмена</button>
              <button onClick={confirmOrder} className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">Подтвердить</button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default Cart;
