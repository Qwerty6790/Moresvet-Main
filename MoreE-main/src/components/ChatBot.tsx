import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  X, 
  MessageCircle, 
  ChevronDown, 
  Sun, 
  Moon, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';

interface Product {
  name: string;
  description: string;
  price: string;
  rating: number;
  image: string;
  features: string[];
  recommendations: string;
}

interface Message {
  type: 'user' | 'bot';
  content: string;
  products?: Product[];
  suggestions?: string[];
}

const products: Record<string, Product> = {
  классическая: {
    name: 'Хрустальная люстра "Версаль"',
    description: 'Роскошная классическая люстра с хрустальными подвесками и позолоченной фурнитурой.',
    price: '45000 руб',
    rating: 4.8,
    image: '/api/placeholder/300/200',
    features: [
      'Материал: хрусталь, металл с позолотой',
      '12 ламп E14',
      'Мощность: 40W на лампу',
      'Диаметр: 80 см',
      'Высота: 100 см',
      'Стиль: классический',
      'Дистанционное управление',
      'Регулировка яркости'
    ],
    recommendations: 'Идеально подходит для гостиных и залов с высокими потолками в классическом стиле.',
  },
  современная: {
    name: 'Светодиодная люстра "Орбита"',
    description: 'Современная геометрическая люстра с LED-подсветкой и настраиваемой цветовой температурой.',
    price: '32000 руб',
    rating: 4.9,
    image: '/api/placeholder/300/200',
    features: [
      'Встроенные LED-элементы',
      'Мощность: 80W',
      'Диаметр: 60 см',
      'Материал: алюминий, акрил',
      'Smart-управление',
      'RGB-подсветка',
      'Wi-Fi подключение',
      'Совместимость с умным домом'
    ],
    recommendations: 'Отлично впишется в минималистичный или хай-тек интерьер.',
  },
  лофт: {
    name: 'Индустриальная люстра "Эдисон"',
    description: 'Стильная лофт-люстра с винтажными лампами Эдисона и черным металлическим каркасом.',
    price: '28000 руб',
    rating: 4.7,
    image: '/api/placeholder/300/200',
    features: [
      'Материал: черный металл',
      '8 ламп E27',
      'Винтажные лампы в комплекте',
      'Регулируемая высота',
      'Ширина: 100 см',
      'Высота: 40-120 см',
      'Состаренная отделка',
      'Индустриальный дизайн'
    ],
    recommendations: 'Прекрасно подойдет для лофт-интерьеров, кафе, ресторанов или современных квартир.',
  }
};

const SmartLightingBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: 'Здравствуйте! Я ваш персональный ассистент по освещению. Помогу подобрать идеальную люстру или светильник для вашего интерьера.',
      suggestions: ['Показать каталог', 'Помощь в выборе', 'Популярные модели']
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleProductSelect = (product: Product) => {
    const response: Message = {
      type: 'bot',
      content: `
📱 ${product.name}

${product.description}

💰 Цена: ${product.price}
⭐️ Рейтинг: ${product.rating}

✨ Характеристики:
${product.features.map(f => `• ${f}`).join('\n')}

💡 Рекомендации:
${product.recommendations}
      `,
      suggestions: ['Заказать', 'Другие модели', 'Сравнить']
    };
    setMessages(prev => [...prev, response]);
  };

  const generateResponse = (userMessage: string): Message => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('каталог') || msg.includes('показать')) {
      return {
        type: 'bot',
        content: 'Вот наши популярные модели люстр:',
        products: [products.классическая, products.современная, products.лофт],
        suggestions: ['Классический стиль', 'Современный стиль', 'Лофт']
      };
    }

    if (msg.includes('класс') || msg.includes('классическ')) {
      return {
        type: 'bot',
        content: 'Вот наша классическая модель:',
        products: [products.классическая],
        suggestions: ['Узнать цену', 'Характеристики', 'Другие стили']
      };
    }

    return {
      type: 'bot',
      content: 'Чем могу помочь в выборе освещения?',
      suggestions: ['Показать каталог', 'Помощь в выборе', 'Популярные модели']
    };
  };

  const sendMessage = () => {
    if (userInput.trim()) {
      const newMessage: Message = { type: 'user', content: userInput };
      setMessages(prev => [...prev, newMessage]);
      setUserInput('');
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const botResponse = generateResponse(newMessage.content);
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
    sendMessage();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div>
      <div
        className={`fixed bottom-6 max-md:hidden right-0 max-md:w-full w-96  bg-white shadow-xl  rounded-lg overflow-hidden flex flex-col transition-all duration-300 transform ${
          isOpen ? 'h-[600px]' : 'h-[60px]'
        }`}
      >
        {/* Header */}
        <div
          className={`${
            theme === 'light' ? 'bg-gradient-to-r bg-white ' : 'bg-gradient-to-r text-white from-gray-800 to-gray-900'
          } text-black p-4 flex justify-between items-center cursor-pointer`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="animate-pulse" />
            <span className="font-semibold">Умный помощник по освещению</span>
          </div>
          <div className="flex items-center gap-2">
            {theme === 'light' ? (
              <Moon size={20} className="hover:text-purple-200 cursor-pointer" onClick={() => setTheme('dark')} />
            ) : (
              <Sun size={20} className="hover:text-yellow-200 cursor-pointer" onClick={() => setTheme('light')} />
            )}
            {isOpen ? <X size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {isOpen && (
          <>
            {/* Messages */}
            <div className={`flex-1 p-4 overflow-y-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {messages.map((message, index) => (
                <div key={index} className="mb-4">
                  <div
                    className={`${
                      message.type === 'user' ? 'ml-auto' : 'mr-auto'
                    } max-w-[80%]`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-white text-black'
                          : theme === 'dark'
                          ? 'bg-gray-800 text-white'
                          : 'bg-white text-gray-800 shadow-sm'
                      }`}
                    >
                      {message.content}
                    </div>

                    {message.products && (
                      <div className="mt-4 space-y-4">
                        {message.products.map((product, idx) => (
                          <div key={idx} className="bg-white rounded-lg shadow-lg p-4">
                            <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                            <p className="text-gray-600 mb-2">{product.description}</p>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-purple-600 font-bold">{product.price}</span>
                              <div className="flex items-center">
                                <span className="text-yellow-500 mr-1">★</span>
                                <span>{product.rating}</span>
                              </div>
                            </div>
                            <button 
                              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                              onClick={() => handleProductSelect(product)}
                            >
                              Подробнее
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {message.suggestions && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`px-3 py-1 rounded-full text-sm ${
                              theme === 'dark'
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-t`}>
            <div className="flex gap-2 flex-wrap">
  <input
    type="text"
    value={userInput}
    onChange={(e) => setUserInput(e.target.value)}
    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
    placeholder="Напишите ваш вопрос..."
    className={`flex-1 p-2 rounded-lg focus:outline-none ${
      theme === 'dark'
        ? 'bg-gray-700 text-white'
        : 'bg-gray-100 border-gray-300'
    }`}
  />
  <button
    onClick={sendMessage}
    className="p-2 bg-white text-black rounded-lg hover:opacity-90 transition-opacity"
  >
    <Send size={20} />
  </button>
</div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SmartLightingBot;
