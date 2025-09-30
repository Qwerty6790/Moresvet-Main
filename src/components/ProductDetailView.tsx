import React, { useEffect, useState, useMemo } from 'react';
import { Heart, Copy, ChevronDown, Star, MessageSquare } from 'lucide-react';
import Header from '@/components/Header';

// Интерфейс расширен, чтобы включать все поля из дизайна
interface ProductI {
  _id: string;
  article: string;
  name:string;
  price: number;
  imageAddress: string | string[];
  imageAddresses?: string[] | string;
  stock: number;
  source: string; // Производитель
  visible?: boolean;
  quantity?: number;

  // Размеры
  height?: number;
  width?: number; // Добавлено
  length?: number; // Добавлено
  diameter?: number;
  area?: number; // Площадь освещения

  // Электрика
  lampType?: string; // Вид ламп
  socketType?: string; // Цоколь
  lampPower?: number; // Мощность лампы, W
  totalPower?: number; // Общая мощность, W
  voltage?: number;

  // Внешний вид
  lightStyle?: string; // Стиль
  shadeMaterial?: string; // Материал плафона/абажура
  shadeColor?: string; // Цвет плафона/абажура
  frameMaterial?: string; // Материал арматуры
  frameColor?: string; // Цвет арматуры
  shadeDirection?: string; // Направление абажуров/плафонов
  shadesCount?: number; // Количество плафонов/абажуров
  shadeShape?: string; // Форма плафона

  // Доп. параметры
  collection?: string; // Коллекция
  room?: string; // Место в интерьере
  ipProtection?: number; // Степень защиты (IP)
  lampsIncluded?: boolean; // Лампы в комплекте
  position?: string; // Расположение
  country?: string; // Страна
  colorTemperature?: string; // Цветовая температура
}


const ProductDetailView: React.FC<{ product: ProductI }> = ({ product }) => {
  const [mainImage, setMainImage] = useState<string>('');
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [failedThumbnailIndices, setFailedThumbnailIndices] = useState<number[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Состояние для открытых секций аккордеона
  const [openAccordion, setOpenAccordion] = useState<string | null>('Электрика');

  useEffect(() => {
    if (!product) return;
    const allImages =
      typeof product.imageAddresses === 'string'
        ? [product.imageAddresses]
        : Array.isArray(product.imageAddresses)
        ? product.imageAddresses
        : typeof product.imageAddress === 'string'
        ? [product.imageAddress]
        : Array.isArray(product.imageAddress)
        ? product.imageAddress
        : [];
    if (allImages.length > 0) {
      setMainImage(allImages[0]);
      setMainImageError(false);
      setThumbnails(allImages);
      setFailedThumbnailIndices([]);
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      const likedData = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
      const exists = likedData.products.some((p: any) => p._id === product._id);
      setIsFavorite(exists);
    }
  }, [product]);

  const toggleFavorite = () => {
    if (!product) return;
    const likedData = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    if (isFavorite) {
      likedData.products = likedData.products.filter((p: any) => p._id !== product._id);
    } else {
      likedData.products.push(product);
    }
    localStorage.setItem('liked', JSON.stringify(likedData));
    setIsFavorite(!isFavorite);
    const count = likedData.products.length;
    window.dispatchEvent(new CustomEvent('liked:updated', { detail: { count } }));
    if (!isFavorite) {
      window.dispatchEvent(new CustomEvent('liked:itemAdded', { detail: { name: product.name, imageUrl: mainImage } }));
    }
  };

  const copyArticle = async () => {
    if (!product || !product.article) return;
    try {
      await navigator.clipboard.writeText(String(product.article));
      // Можно добавить уведомление об успешном копировании
    } catch (err) {
      console.error('Ошибка копирования артикула:', err);
    }
  };

  const addToCart = (p: ProductI) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
      const idx = cart.products.findIndex((item: any) => item.article === p.article);
      if (idx > -1) {
        cart.products[idx].quantity += 1;
      } else {
        cart.products.push({ article: p.article, source: p.source, name: p.name, quantity: 1, price: p.price, imageUrl: mainImage });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      const count = cart.products.reduce((acc: number, item: any) => acc + item.quantity, 0);
      localStorage.setItem('cartCount', String(count));
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }));
      window.dispatchEvent(new CustomEvent('cart:itemAdded', { detail: { name: p.name, price: p.price, imageUrl: mainImage } }));
    } catch (err) {
      console.error('Ошибка добавления в корзину со компонента', err);
    }
  };
  
  const parsedFromName = useMemo(() => {
    if (!product?.name) return {};
    
    const parse = (regex: RegExp) => {
      const match = product.name.match(regex);
      if (!match || !match[1]) return null;
      const cleanedString = match[1].replace(/[,.;]/g, '');
      return parseInt(cleanedString, 10);
    };

    return {
      height: parse(/[Hh](\d+)/),
      width: parse(/[Ww](\d+)/),
      diameter: parse(/[Dd](\d+)/),
      length: parse(/[Ll](\d+)/),
      ipProtection: parse(/[Ii][Pp]\s*(\d{2})/),
      lampPower: parse(/\b([\d,.]+)\s*W\b/i),
      voltage: parse(/\b([\d,.]+)\s*V\b/i),
    };
  }, [product?.name]);

  const characteristicGroups = useMemo(() => {
    const p = product; 
    if (!p) return [];
    const pf = parsedFromName;

    const final = {
      height: p.height || pf.height,
      diameter: p.diameter || pf.diameter,
      width: p.width || pf.width,
      length: p.length || pf.length,
      area: p.area,
      lampPower: p.lampPower || pf.lampPower,
      totalPower: p.totalPower,
      voltage: p.voltage || pf.voltage,
      ipProtection: p.ipProtection || pf.ipProtection,
    };
    
    const clean = (value: any) => typeof value === 'string' ? value.replace(/[,;]/g, '') : value;

    return [
      {
        title: 'Основные характеристики',
        items: [
          { label: 'Производитель', value: clean(p.source) },
          { label: 'Коллекция', value: clean(p.collection) },
          { label: 'Стиль', value: clean(p.lightStyle) },
          { label: 'Место в интерьере', value: clean(p.room) },
          { label: 'Страна', value: clean(p.country) },
        ]
      },
      {
        title: 'Размеры',
        items: [
          { label: 'Высота, мм', value: final.height },
          { label: 'Диаметр, мм', value: final.diameter },
          { label: 'Ширина, мм', value: final.width },
          { label: 'Длина, мм', value: final.length },
          { label: 'Площадь освещения, м²', value: final.area },
        ]
      },
      {
        title: 'Внешний вид',
        items: [
          { label: 'Материал плафона', value: clean(p.shadeMaterial) },
          { label: 'Цвет плафона', value: clean(p.shadeColor) },
          { label: 'Форма плафона', value: clean(p.shadeShape) },
          { label: 'Материал арматуры', value: clean(p.frameMaterial) },
          { label: 'Цвет арматуры', value: clean(p.frameColor) },
          { label: 'Направление плафонов', value: clean(p.shadeDirection) },
          { label: 'Кол-во плафонов', value: p.shadesCount },
        ]
      },
      {
        title: 'Электрика',
        items: [
          { label: 'Вид ламп', value: clean(p.lampType) },
          { label: 'Цоколь', value: clean(p.socketType) },
          { label: 'Мощность лампы, W', value: final.lampPower },
          { label: 'Общая мощность, W', value: final.totalPower },
          { label: 'Напряжение, V', value: final.voltage },
          { label: 'Степень защиты (IP)', value: final.ipProtection ? `IP${final.ipProtection}` : null },
          { label: 'Лампы в комплекте', value: p.lampsIncluded ? 'Да' : 'Нет' },
          { label: 'Цветовая температура', value: clean(p.colorTemperature) },
        ]
      }
    ].map(group => ({
      ...group,
      items: group.items.filter(item => item.value != null && item.value !== ''),
    })).filter(group => group.items.length > 0);
  }, [product, parsedFromName]);

  if (!product) {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="text-center py-20">Загрузка...</div>
        </div>
    );
  }

  const CharacteristicRow = ({ label, value }: { label: string, value: any }) => (
    <div className="flex justify-between items-baseline text-sm py-2 border-b border-gray-100">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  );

  const AccordionSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const isOpen = openAccordion === title;
    return (
        <div className="border-b border-gray-200">
            <button
                className="w-full flex justify-between items-center py-4 text-left"
                onClick={() => setOpenAccordion(isOpen ? null : title)}
            >
                <h3 className="text-lg font-semibold">{title}</h3>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="pb-4">{children}</div>}
        </div>
    );
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
          
          {/* Левая колонка: Галерея изображений */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto pr-2">
                {thumbnails.map((img, idx) => {
                  if (failedThumbnailIndices.includes(idx)) return null;
                  return (
                    <button 
                      key={idx} 
                      onClick={() => { setMainImage(img); setMainImageError(false); }} 
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${mainImage === img ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img 
                        src={`${img}?q=75&w=100`} 
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-contain" 
                        onError={() => setFailedThumbnailIndices((prev) => [...prev, idx])}
                      />
                    </button>
                  );
                })}
            </div>
            <div className="flex-1  bg-white rounded-lg flex items-center justify-center p-4">
              {!mainImageError && mainImage ? (
                  <img 
                    src={`${mainImage}?q=75&w=800`} 
                    alt={product.name}
                    className="max-w-full max-h-full object-contain mix-blend-multiply" 
                    onError={() => setMainImageError(true)} 
                  />
              ) : (
                <div className="text-gray-500">Изображение не найдено</div>
              )}
            </div>
          </div>
          
          {/* Правая колонка: Информация о товаре */}
          <div className="w-full mt-8 lg:mt-0">
            <div className='lg:sticky top-24'>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Артикул: {product.article}</span>
                <div className="flex items-center gap-2">
                    <button onClick={copyArticle} title="Копировать артикул" className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                      <Copy className="w-5 h-5" />
                    </button>
                    <button onClick={toggleFavorite} title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'} className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors">
                      <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
                    </button>
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                </div>
                <span className="text-sm text-gray-600">4.8 (32 отзыва)</span>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <div className="flex items-baseline justify-between mb-4">
                    <span className="text-4xl font-extrabold text-gray-900">{new Intl.NumberFormat('ru-RU').format(product.price)} ₽</span>
                    {product.stock > 0 ? (
                      <span className="text-sm font-medium text-green-600">В наличии: {product.stock} шт.</span>
                    ) : (
                      <span className="text-sm font-medium text-red-600">Нет в наличии</span>
                    )}
                </div>
                <button 
                  onClick={() => addToCart(product)} 
                  className="w-full px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
                  disabled={product.stock === 0}
                >
                
                  Добавить в корзину
                </button>
              </div>
              
              <div className="space-y-2">
                {characteristicGroups.map(group => (
                  <AccordionSection key={group.title} title={group.title}>
                    <div className="space-y-1">
                      {group.items.map(item => (
                        <CharacteristicRow key={item.label} label={item.label} value={item.value} />
                      ))}
                    </div>
                  </AccordionSection>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailView;