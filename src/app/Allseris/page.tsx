'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  logo: string;
}

interface Series {
  id: string;
  name: string;
  image: string;
  brandId: string;
}

interface Color {
  id: string;
  name: string;
  image: string;
  url: string;
}

interface Frame {
  id: string;
  name: string;
  image: string;
  url: string;
}

interface SeriesWithColors {
  id: string;
  name: string;
  image: string;
  brandId: string;
  colors: Color[];
  frames?: Frame[];
}

const AllSeriesPage = () => {
  // Доступные бренды
  const brands: Brand[] = [  
    { id: 'donel', name: 'Donel', logo: '/images/DonelLogo.png' },
    { id: 'werkel', name: 'Werkel', logo: '/images/WerkelLogo.png' },
    { id: 'voltum', name: 'Voltum', logo: '/images/VoltumLogo.png' },
  ];

  // Все серии по брендам с данными о цветах
  const allSeriesWithColors: SeriesWithColors[] = [
    // Donel серии
    { 
      id: 'r98', 
      name: 'Серия R98', 
      image: '/images/МатовыйИзумрудR98.png', 
      brandId: 'donel',
      colors: [
        // { id: 'black', name: 'Черный', image: '/images/черный.png', url: '/Configurator' },
        // { id: 'stali', name: 'Сталь', image: '/images/сталь.png', url: '/Configurator' },
        // { id: 'matyovyi-shokolad', name: 'Матовый шоколад', image: '/images/матовыйшоколад.png', url: '/Configurator' },
        // { id: 'matyovyi-seriy', name: 'Матовый серый', image: '/images/матовыйсерый.png', url: '/Configurator' },
        // { id: 'matyovyi-korbon', name: 'Матовый корбон', image: '/images/матовыйкорбон.png', url: '/Configurator' },
        // { id: 'matyovyi-koral', name: 'Матовый коралл', image: '/images/матовыйкоралл.png', url: '/Configurator' },
        // { id: 'matyovyi-kashmir', name: 'Матовый кашмир', image: '/images/матовыйкашемир.png', url: '/Configurator' },
        // { id: 'matyovyi-beliy', name: 'Матовый белый', image: '/images/матовыйбелый.png', url: '/Configurator' },
        // { id: 'matyovyi-emirald', name: 'Матовый изумрудный', image: '/images/МатовыйИзумрудR98.png', url: '/Configurator' },
        // { id: 'white', name: 'Белый', image: '/images/белый.png', url: '/Configurator' },
        // { id: 'aluminum', name: 'Алюминий', image: '/images/алюминий.png', url: '/Configurator' },
      ]
    },
    { 
      id: 'r98-metal', 
      name: 'Серия R98 METAL', 
      image: '/images/ЛатуньR98METAL.png', 
      brandId: 'donel',
      colors: [
        { id: 'brass', name: 'Латунь', image: '/images/ЛатуньR98METAL.png', url: '/Configurator' },
        { id: 'nickel', name: 'Никель', image: '/images/никель.png', url: '/Configurator' },
        { id: 'voronenay stali', name: 'вороненая сталь', image: '/images/вороненаясталь.png', url: '/Configurator' },
        { id: 'blagodarnaya stali', name: 'благородная сталь', image: '/images/благородная сталь.png', url: '/Configurator' },
      ]
    },
    { 
      id: 'n96', 
      name: 'Серия N96', 
      image: '/images/черныйN96.png', 
      brandId: 'donel',
      colors: [
        { id: 'black', name: 'Черный', image: '/images/черныйN96.png', url: '/Configurator' },
        { id: 'white', name: 'Белый', image: '/images/белыйn96.png', url: '/Configurator' },
        { id: 'white', name: 'Никель', image: '/images/никельn96.png', url: '/Configurator' },
        { id: 'white', name: 'Латунь', image: '/images/латуньn96.png', url: '/Configurator' },
        { id: 'white', name: 'Вороненая сталь', image: '/images/вороненаястальn96.png', url: '/Configurator' },
      ]
    },
    { 
      id: 'a07', 
      name: 'Серия A07', 
      image: '/images/МатовыйтитанA07.png', 
      brandId: 'donel',
      colors: [
        { 
          id: 'mechanisms', 
          name: 'Механизмы', 
          image: '/images/Розеткителевезионные.webp', 
          url: '/catalog/products?category=A07&page=1&subcategory=&source=Donel'
        },
        { id: 'titan', name: 'Шампань', image: '/images/шампаньa07.png', url: '/catalog/products?category=шампань%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,S08' },
        { id: 'titan', name: 'Сталь', image: '/images/стальa07.png', url: '/catalog/products?category=матовый%20серый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,S08' },
        { id: 'black', name: 'Матовый серый', image: '/images/матовыйсерыйa07.png', url: '/catalog/products?category=матовый%20серый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,S08' },
        { id: 'titan', name: 'Мокко', image: '/images/моккоa07.png', url: '/catalog/products?category=матовый%20серый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,S08' },
        { id: 'black', name: 'Матовый кремовый', image: '/images/матовыйкремовыйa07.png', url: '/catalog/products?category=матовый%20кремовый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,S08' },
        { id: 'titan', name: 'Матовый кашемир', image: '/images/матовыйкашемирa07.png', url: '/catalog/products?category=матовый%20кремовый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,S08' },
        { id: 'black', name: 'Матовый карбон', image: '/images/матовыйкарбонa07.png', url: '/catalog/products?category=матовый%20кремовый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,S08' },
        { id: 'titan', name: 'Матовый титан', image: '/images/МатовыйтитанA07.png', url: '/catalog/products?category=матовый%20кремовый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,S08' },
        { id: 'black', name: 'Матовый белый', image: '/images/матовыйбелыйa07.png', url: '/catalog/products?category=матовый%20кремовый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,S08' },
        { id: 'black', name: 'Глянцевый белый', image: '/images/глянцевыйбелыйa07.png', url: '/catalog/products?category=матовый%20кремовый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,S08' },
      ]
    },
    { 
      id: 'a07-wave', 
      name: 'Серия A07 WAVE', 
      image: '/images/ГлянцевыйWAVE.png', 
      brandId: 'donel',
      colors: [
        { 
          id: 'mechanisms', 
          name: 'Механизмы', 
          image: '/images/Розеткителевезионные.webp', 
          url: '/catalog/products?category=Wave&page=1&subcategory=&source=Donel'
        },
        { id: 'titan', name: 'Шампань', image: '/images/шампаньWave.png', url: '/catalog/products?category=%20Wave%20шампань%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Natural,S08' },
        { id: 'titan', name: 'Сталь', image: '/images/стальWave.png', url: '/catalog/products?category=%20Wave%20сталь%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Natural,S08' },
        { id: 'titan', name: 'Мокко', image: '/images/моккоWave.png', url: '/catalog/products?category=%20Wave%20мокко%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Natural,S08' },
        { id: 'black', name: 'Матовый титан', image: '/images/матовыйтитанWave.png', url: '/catalog/products?category=%20Wave%20матовый%20титан%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Natural,S08' },
        { id: 'titan', name: 'Матовый серый', image: '/images/матовыйсерыйWave.png', url: '/catalog/products?category=%20Wave%20матовый%20серый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Natural,S08' },
        { id: 'black', name: 'Матовый кашемир', image: '/images/матовыйкашемирWave.png', url: '/catalog/products?category=%20Wave%20матовый%20кашемир%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Natural,S08' },
        { id: 'titan', name: 'Матовый карбон', image: '/images/матовыйкарбонWave.png', url: '/catalog/products?category=%20Wave%20матовый%20карбон%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Natural,S08' },
        { id: 'black', name: 'Матовый белый', image: '/images/матовыйбелыйWave.png', url: '/catalog/products?category=%20Wave%20матовый%20белый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Natural,S08' },
        { id: 'black', name: 'Глянцевый', image: '/images/ГлянцевыйWAVE.png', url: '/catalog/products?category=%20Wave%20глянцевый%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Natural,S08' },
      ]
    },
    { 
      id: 'a07-natural', 
      name: 'Серия A07 NATURAL', 
      image: '/images/золотистыйNATURAL Glass.png', 
      brandId: 'donel',
      colors: [
        { 
          id: 'mechanisms', 
          name: 'Механизмы', 
          image: '/images/Розеткителевезионные.webp', 
          url: '/catalog/products?category=Natural&page=1&subcategory=&source=Donel'
        },
        { id: 'gold', name: 'Золотистый алюминий', image: '/images/золотистыйNATURAL Glass.png', url: '/catalog/products?category=%20Natural%20золотистый%20алюминий%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,S08' },
        { id: 'silver', name: 'Бронзовый алюминий', image: '/images/NATURAL metal.png', url: '/catalog/products?category=%20Natural%20Бронзовый%20алюминий%2C%20серия%20A07&page=1&subcategory=&source=Donel&exclude_name=Wave,S08' },
      ]
    },
    { 
      id: 's08', 
      name: 'Серия S08', 
      image: '/images/S08шампань.png', 
      brandId: 'donel',
      colors: [
        { 
          id: 'mechanisms', 
          name: 'Механизмы', 
          image: '/images/Розеткителевезионные.webp', 
          url: '/catalog/products?category=S08&page=1&subcategory=&source=Donel'
        },
        { id: 'champagne', name: 'Шампань', image: '/images/S08шампань.png', url: '/catalog/products?category=%20S08%20шампань%2C%20серия%20S08&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,A07' },
        { id: 'silver', name: 'Черный графит', image: '/images/черныйграфитs08.png', url: '/catalog/products?category=%20S08%20черный%20графит%2C%20серия%20S08&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,A07' },
        { id: 'champagne', name: 'Сталь', image: '/images/стальs08.png', url: '/catalog/products?category=%20S08%20сталь%2C%20серия%20S08&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,A07' },
        { id: 'silver', name: 'Слоновая кость', image: '/images/слоноваякостьs08.png', url: '/catalog/products?category=%20S08%20слоновая%20кость%2C%20серия%20S08&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,A07' },
        { id: 'champagne', name: 'Серый графит', image: '/images/серыйграфитs08.png', url: '/catalog/products?category=%20S08%20серый%20графит%2C%20серия%20S08&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,A07' },
        { id: 'silver', name: 'Мокко', image: '/images/моккоs08.png', url: '/catalog/products?category=%20S08%20мокко%2C%20серия%20S08&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,A07' },
        { id: 'silver', name: 'Матовый титан', image: '/images/матовыйтитанs08.png', url: '/catalog/products?category=%20S08%20матовый%20титан%2C%20серия%20S08&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,A07' },
        { id: 'silver', name: 'Матовый белый', image: '/images/матовыйбелыйs08.png', url: '/catalog/products?category=%20S08%20матовый%20белый%2C%20серия%20S08&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,A07' },
        { id: 'silver', name: 'Глянцевый белый', image: '/images/глянцевыйбелыйs08.png', url: '/catalog/products?category=%20S08%20глянцевый%20белый%2C%20серия%20S08&page=1&subcategory=&source=Donel&exclude_name=Wave,Natural,A07' },
      ]
    },
    { 
      id: 'w55', 
      name: 'Серия w55', 
      image: '/images/w55.png', 
      brandId: 'donel',
      colors: [
        { id: 'standard', name: 'Накладной', image: '/images/накладнойW55.png', url: '//catalog/products?category=(накладная|накладной)&page=1&subcategory=&source=Donel&exclude_name=профиль,Датчик,Однофазный,Светильник,Трёхфазный' },
        { id: 'black', name: 'Встроенный', image: '/images/встроенныйW55.png', url: '/catalog/products?category=скрытой&page=1&subcategory=&source=Donel&exclude_name=профиль%2CДатчик%2CОднофазный%2Cветильник&viewMode=grid' },
      ]
    },
    
    
    // Voltum серии
    { 
      id: 'S70', 
      name: 'Серия S70', 
      image: '/images/S70Voltum.png', 
      brandId: 'voltum',
      colors: [
        { id: 'standard', name: 'Шелк', image: '/images/шелкVoltum.png', url: '/catalog/products?category=(шелк)&page=1&subcategory=&source=Voltum&exclude_name=' },
        { id: 'silver', name: 'Черный матовый', image: '/images/черныйматовыйVoltum.png', url: '/catalog/products?category=(черный матовый)&page=1&subcategory=&source=Voltum&exclude_name=' },
        { id: 'standard', name: 'Титан', image: '/images/титанVoltum.png', url: '/catalog/products?category=(титан)&page=1&subcategory=&source=Voltum&exclude_name=' },
        { id: 'standard', name: 'Сталь', image: '/images/стальVoltum.png', url: '/catalog/products?category=(сталь)&page=1&subcategory=&source=Voltum&exclude_name=' },
        { id: 'silver', name: 'Кашемир', image: '/images/кашемирVoltum.png', url: '/catalog/products?category=(кашемир)&page=1&subcategory=&source=Voltum&exclude_name=' },
        { id: 'standard', name: 'Графит', image: '/images/графитVoltum.png', url: '/catalog/products?category=(графит)&page=1&subcategory=&source=Voltum&exclude_name=' },
        { id: 'silver', name: 'Белый матовый', image: '/images/белыйматовыйVoltum.png', url: '/catalog/products?category=(белый матовый)&page=1&subcategory=&source=Voltum&exclude_name=' },
        { id: 'silver', name: 'Белый глянцевый', image: '/images/белыйглянцевыйVoltum.png', url: '/catalog/products?category=(белый глянцевый)&page=1&subcategory=&source=Voltum&exclude_name=' },
      ]
    },
    
    // Werkel серии
    { 
        id: 'info-sockets', 
        name: 'Встраиваемая серия', 
        image: '/images/ВстраиваемыесерииWerkel.png', 
        brandId: 'werkel',
        colors: [
          { id: 'standard', name: 'Белое глянцевое', image: '/images/белыйглянцевыйWerkel.webp', url: '/catalog/products?category=(белый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'black', name: 'Черный матовый', image: '/images/черныйматовыйWerkel.webp', url: '/catalog/products?category=(черный матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'standard', name: 'Белый акрил', image: '/images/белыйакрилWerkel.webp', url: '/catalog/products?category=(белый акрил)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'silver', name: 'Серебряный матовый', image: '/images/серебряныйматовыйWerkel.webp', url: '/catalog/products?category=(серебряный матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'black', name: 'Серебряныйрифленый', image: '/images/серебряныйрифленыйWerkel.webp', url: '/catalog/products?category=(серебряный рифленый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'standard', name: 'Хаммер все цвета', image: '/images/хаммерсеребряныйWerkel.webp', url: '/catalog/products?category=W12&exclude_name=дымчатый,модульная розетка&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'black', name: 'Никель рифленый глянцевый', image: '/images/никельрифленыйглянцевыйWerkel.webp', url: '/catalog/products?category=(глянцевый никель)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'standard', name: 'Перламутровый рифленый', image: '/images/перламутровыйрифленыйWerkel.webp', url: '/catalog/products?category=(перламутровый рифленый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'black', name: 'Айвори матовый', image: '/images/айвориматовыйWerkel.webp', url: '/catalog/products?category=(айвори матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },    
          { id: 'standard', name: 'Айвори акрил', image: '/images/айвориакрилWerkel.webp', url: '/catalog/products?category=(айвори акрил)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'black', name: 'Слоновая кость глянцевый', image: '/images/слоноваякостьгялнцевыйWerkel.webp', url: '/catalog/products?category=(слоновая кость)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'standard', name: 'Дымчатый матовый', image: '/images/дымчатыйматовыйWerkel.webp', url: '/catalog/products?category=(дымчатый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'black', name: 'Шампань металлик', image: '/images/шампаньметалликWerkel.webp', url: '/catalog/products?category=(шампань)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'standard', name: 'Шампань рифленый', image: '/images/шампаньрифленыйWerkel.webp', url: '/catalog/products?category=шампань%20рифленый&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'black', name: 'Бронза рифленый', image: '/images/бронзарифленыйWerkel.webp', url: '/catalog/products?category=(бронзовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'standard', name: 'Графит акрил', image: '/images/графитакрилWerkel.webp', url: '/catalog/products?category=(графит акрил)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'black', name: 'Графит матовый', image: '/images/графитматовыйWerkel.webp', url: '/catalog/products?category=(графит матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'standard', name: 'Графит рифленый', image: '/images/графитрифленыйWerkel.webp', url: '/catalog/products?category=(графит рифленый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'black', name: 'Черный акрил', image: '/images/черныйакрилWerkel.webp', url: '/catalog/products?category=(черный)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
          { id: 'standard', name: 'Черный матовый', image: '/images/черныйматовыйWerkel.webp', url: '/catalog/products?category=(черный матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Рамка' },
        ],
        frames: [
          { id: 'frame-white-glossy', name: 'Черная латунь', image: '/images/черныйлатуньрамкаWerkel.webp', url: '/catalog/products?category=(черный/латунь)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-white-matte', name: 'Черный алюминий', image: '/images/черныйалюминийрамкаWerkel.webp', url: '/catalog/products?category=(черный алюминий)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-silver-matte', name: 'Хаммер', image: '/images/хаммеррамкаWerkel.webp', url: '/catalog/products?category=08&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка,Диммер,черный алюминий,Встраиваемая,soft,Acrylic,Умный' },
          { id: 'frame-black-matte', name: 'Слоновая кость', image: '/images/слоноваякостьрамкаWerkel.webp', url: '/catalog/products?category=(слоновая кость)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-silver-matte', name: 'Серый', image: '/images/серыйрамкаWerkel.webp', url: '/catalog/products?category=(серый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-black-matte', name: 'Серебряный матовый', image: '/images/серебряныйматовыйрамкаWerkel.webp', url: '/catalog/products?category=(серебряный матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-black-matte', name: 'Серебро', image: '/images/сереброрамкаWerkel.webp', url: '/catalog/products?category=(серебро)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-silver-matte', name: 'Перламутровый', image: '/images/перламутровыйрамкаWerkel.webp', url: '/catalog/products?category=(перламутровый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-black-matte', name: 'Молочный', image: '/images/молочныйрамкаWerkel.webp', url: '/catalog/werkel/frames?color=black-matte' },
          { id: 'frame-black-matte', name: 'Латте', image: '/images/латтерамкаWerkel.webp', url: '/catalog/products?category=(латунь)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-silver-matte', name: 'Дымчатый', image: '/images/дымчатыйрамкаWerkel.webp', url: '/catalog/products?category=(дымчатый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-black-matte', name: 'Дымчатый белый', image: '/images/дымчатыйбелыйрамкаWerkel.webp', url: '/catalog/products?category=(дымчатый белый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-black-matte', name: 'Графит матовый', image: '/images/графитматовыйрамкаWerkel.webp', url: '/catalog/products?category=(графит матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-silver-matte', name: 'Бронза матовый', image: '/images/бронзаматовыйрамкаWerkel.webp', url: '/catalog/products?category=(бронза матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-black-matte', name: 'Белый черный', image: '/images/белыйчерныйрамкаWerkel.webp', url: '/catalog/products?category=(белый черный)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-black-matte', name: 'Белый матовый', image: '/images/белыйматовыйрамкаWerkel.webp', url: '/catalog/products?category=(белый матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-silver-matte', name: 'Айвори матовый', image: '/images/айвориматовыйрамкаWerkel.webp', url: '/catalog/products?category=(айвори матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-black-matte', name: 'Айвори латунь', image: '/images/айворилатуньрамкаWerkel.webp', url: '/catalog/products?category=(айвори латунь)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
          { id: 'frame-black-matte', name: 'Айвори белый', image: '/images/айворибелыйрамкаWerkel.webp', url: '/catalog/products?category=(айвори белый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
        ]
      },
    { 
      id: 'termostats', 
      name: 'Серия Gallant', 
      image: '/images/Gallantсерия.png', 
      brandId: 'werkel',
      colors: [
        { id: 'standard', name: 'Графит рифленый', image: '/images/графитрифленыйGallant.webp', url: '/catalog/products?category=(графит%20рифленый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage%2CРетро%2CРамка%2C,Выключатель%20двухлавшиный,Выключатель%20одноклавишный,ТВ,Розетка%20с%20заземлением,проходной,Клавиша,Розетка двойная,Диммер,с посдсветкой,RJ-45,Набор клавиш,Акустическая,Накладка,Заглушка,W1120104,W1120004' },
        { id: 'black', name: 'Черный хром', image: '/images/черныйхромGallant.webp', url: '/catalog/products?category=(черный/хром)&page=1&subcategory=&source=Werkel&exclude_name=Vintage%2CРетро%2CРамка%2C,Выключатель%20двухлавшиный,Выключатель%20одноклавишный,ТВ,Розетка%20с%20заземлением,проходной,Клавиша,Розетка двойная,Диммер,с посдсветкой,RJ-45,Набор клавиш,Акустическая,Накладка,Заглушка,W1120104,W1120004' },
        { id: 'standard', name: 'Слоновая кость', image: '/images/слоноваякостьGallant.webp', url: '/catalog/products?category=(слоновая кость)&page=1&subcategory=&source=Werkel&exclude_name=Vintage%2CРетро%2CРамка%2C,Выключатель%20двухлавшиный,Выключатель%20одноклавишный,ТВ,Розетка%20с%20заземлением,проходной,Клавиша,Розетка двойная,Диммер,с посдсветкой,RJ-45,Набор клавиш,Акустическая,Накладка,Заглушка,W1120104,W1120004,на 4 положения,с быстрой зарядкой,с самовозвратом,перекрестный переключатель,Датчик движения,Розетка с подсветкой,коробка,трехклавишный,Телефонная розетка' },
        { id: 'black', name: 'Серебряный', image: '/images/серебряныйGallant.webp', url: '/catalog/products?category=(серебряный)&page=2&subcategory=&source=Werkel&exclude_name=Vintage%2CРетро%2CРамка%2C,Выключатель%20двухлавшиный,Выключатель%20одноклавишный,ТВ,Розетка%20с%20заземлением,проходной,Клавиша,Розетка двойная,Диммер,с посдсветкой,RJ-45,Набор клавиш,Акустическая,Накладка,Заглушка,W1120104,W1120004,на 4 положения,с быстрой зарядкой,с самовозвратом,перекрестный переключатель,Датчик движения,Розетка с подсветкой,коробка,трехклавишный,Телефонная розетка,W122,W112,W452,Выдвижной,W115,W117,W127' },
        { id: 'standard', name: 'Шампань рифленый', image: '/images/шампаньрифленыйGallant.webp', url: '/catalog/products?category=(шампань)&page=2&subcategory=&source=Werkel&exclude_name=Vintage%2CРетро%2CРамка%2C,Выключатель%20двухлавшиный,Выключатель%20одноклавишный,ТВ,Розетка%20с%20заземлением,проходной,Клавиша,Розетка двойная,Диммер,с посдсветкой,RJ-45,Набор клавиш,Акустическая,Накладка,Заглушка,W1120104,W1120004,на 4 положения,с быстрой зарядкой,с самовозвратом,перекрестный переключатель,Датчик движения,Розетка с подсветкой,коробка,трехклавишный,Телефонная розетка,W122,W112,W452,Выдвижной,W115,W117,W127' },
        { id: 'black', name: 'Белый', image: '/images/белыйGallant.webp', url: '/catalog/products?category=(белый)&page=4&subcategory=&source=Werkel&exclude_name=Vintage%2CРетро%2CРамка%2C,Выключатель%20двухлавшиный,Выключатель%20одноклавишный,ТВ,Розетка%20с%20заземлением,проходной,Клавиша,Розетка двойная,Диммер,с посдсветкой,RJ-45,Набор клавиш,Акустическая,Накладка,Заглушка,W1120104,W1120004,на 4 положения,с быстрой зарядкой,с самовозвратом,перекрестный переключатель,Датчик движения,Розетка с подсветкой,коробка,трехклавишный,Телефонная розетка,W122,W112,W452,Выдвижной,W115,W117,W127,Блок,Кнопка звонка,Розетка с вилкой,HDMI' },
      ]
    },
    { 
      id: 'light-regulators', 
      name: 'Серия Retro', 
      image: '/images/Retro.png', 
      brandId: 'werkel',
      colors: [
        { id: 'standard', name: 'Метталическое', image: '/images/ретрометалическоеWerkel.webp', url: '/catalog/products?category=(Матовый%20хром)&page=1&subcategory=&source=Werkel&exclude_name=' },
        { id: 'black', name: 'Керамическое', image: '/images/ретрокерамическоеWerkel.webp', url: '/catalog/products?category=коричневый&page=1&subcategory=&source=Werkel&exclude_name=' },
      ],
      frames: [
        { id: 'frame-retro-standard', name: 'Runda', image: '/images/rundretroрамкаWerkel.webp', url: '/catalog/products?category=W00151|W00152|W00251|W00252|W00351|W00352&page=1&subcategory=&source=Werkel&exclude_name=шампань%2Cмокко%2Cматовый+титан%2Cматовый+серый%2Cматовый+кашемир%2Cматовый+карбон%2Cматовый+белый%2Cглянцевый%2CNatural%2CНакладка%2Cматовый+кремовый&viewMode=grid' },
      ]
    },
    { 
      id: 'sockets-ip66', 
      name: 'Серия Vintage', 
      image: '/images/Vintage.png', 
      brandId: 'werkel',
      colors: [
        { id: 'standard', name: 'Черный матовый', image: '/images/черныйматовыйхромWerkel.webp', url: '/catalog/products?category=(черный%20матовый/хром)&page=1&subcategory=&source=Werkel&exclude_name=' },
        { id: 'silver', name: 'Мокко матовый хром', image: '/images/моккоматоыйхромWerkel.webp', url: '/catalog/products?category=(мокко%20матовый/хром)&page=1&subcategory=&source=Werkel&exclude_name=' },
        { id: 'standard', name: 'Слоновая кость', image: '/images/vintageслоноваякостьWerkel.webp', url: '/catalog/products?category=(слоновая кость матовый/хром)&page=1&subcategory=&source=Werkel&exclude_name=' },
        { id: 'silver', name: 'Серебряный хром', image: '/images/vintageсереброматовыйхромWerkel.webp', url: '/catalog/products?category=(сереброматовый/хром)&page=1&subcategory=&source=Werkel&exclude_name=' },
         { id: 'standard', name: 'Белый матовый хром', image: '/images/vintageбелыйматовыйхромWerkel.webp', url: '/catalog/products?category=(белый матовый/хром)&page=1&subcategory=&source=Werkel&exclude_name=' },
      ],
      frames: [
        { id: 'frame-retro-standard', name: 'Runda', image: '/images/rundretroрамкаWerkel.webp', url: '/catalog/products?category=W00151|W00152|W00251|W00252|W00351|W00352&page=1&subcategory=&source=Werkel&exclude_name=шампань%2Cмокко%2Cматовый+титан%2Cматовый+серый%2Cматовый+кашемир%2Cматовый+карбон%2Cматовый+белый%2Cглянцевый%2CNatural%2CНакладка%2Cматовый+кремовый&viewMode=grid' },
      ]
    },
    
  ];

  // Состояние для выбранного бренда
  const [selectedBrand, setSelectedBrand] = useState<string>('werkel');
  
  // Состояние для выбранной серии
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  
  // Состояние для режима отображения (механизмы или рамки)
  const [viewMode, setViewMode] = useState<'colors' | 'frames'>('colors');
  
  // Фильтрованные серии на основе выбранного бренда
  const [filteredSeries, setFilteredSeries] = useState<SeriesWithColors[]>([]);

  // Обновление серий при изменении выбранного бренда
  useEffect(() => {
    // Фильтруем серии по выбранному бренду
    const series = allSeriesWithColors.filter(
      item => item.brandId === selectedBrand
    );
    setFilteredSeries(series);
    // Сбрасываем выбранную серию и режим при смене бренда
    setSelectedSeries(null);
    setViewMode('colors'); // Сброс на механизмы при смене бренда
  }, [selectedBrand]);
  
  // Функция выбора бренда
  const selectBrand = (brandId: string) => {
    setSelectedBrand(brandId);
  };
  
  // Функция выбора серии
  const selectSeries = (seriesId: string) => {
    setSelectedSeries(seriesId);
    setViewMode('colors'); // Сброс на механизмы при выборе новой серии
  };
  
  // Получение выбранной серии
  const getSelectedSeriesData = () => {
    if (!selectedSeries) return null;
    return allSeriesWithColors.find(series => series.id === selectedSeries);
  };
  
  // Возврат к выбору серий
  const resetSelectedSeries = () => {
    setSelectedSeries(null);
    setViewMode('colors'); // Сброс на механизмы при возврате
  };

  // Проверка, нужно ли показывать переключатель Механизмы/Рамки
  const shouldShowViewModeToggle = () => {
    const seriesData = getSelectedSeriesData();
    return selectedBrand === 'werkel' &&
           seriesData &&
           seriesData.frames && // Проверяем наличие рамок
           seriesData.id !== 'termostats'; // Исключаем Gallant
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-28 mb-16">
      
      {/* Секция выбора бренда */}
      <div className="mb-12">
        <h2 className="text-2xl font-medium mb-6 text-center text-white">Выберите бренд</h2>
        
        <div className="flex justify-center gap-8 flex-wrap">
          {brands.map((brand) => (
            <div 
              key={brand.id} 
              className={`cursor-pointer transition-all p-4 rounded-lg ${selectedBrand === brand.id ? 'border-2 border-white shadow-lg' : 'bg-transparent hover:border-2 hover:border-gray-400'}`}
              onClick={() => selectBrand(brand.id)}
            >
              <div className="relative h-20 w-36 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  {brand.logo ? (
                    <Image 
                      src={brand.logo} 
                      alt={brand.name} 
                      width={120} 
                      height={60} 
                      className="object-contain" 
                    />
                  ) : (
                    <div className="text-lg font-bold text-white">{brand.name}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Если серия выбрана - показываем цвета */}
      {selectedSeries ? (
        <div>
          <div className="mb-6 text-center">
            <h2 className="text-xl font-medium mb-2 text-white">{getSelectedSeriesData()?.name}</h2>
            <button 
              onClick={resetSelectedSeries}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              ← Вернуться к выбору серий
            </button>
          </div>
          
          {/* Переключатель Механизмы/Рамки */}
          {shouldShowViewModeToggle() && (
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setViewMode('colors')}
                className={`px-4 py-2 rounded transition ${viewMode === 'colors' ? 'bg-white text-gray-900 font-semibold' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
              >
                Механизмы
              </button>
              <button
                onClick={() => setViewMode('frames')}
                className={`px-4 py-2 rounded transition ${viewMode === 'frames' ? 'bg-white text-gray-900 font-semibold' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
              >
                Рамки
              </button>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-xl font-medium mb-6 text-center text-white">
              Выберите {viewMode === 'colors' ? 'цвет механизма' : 'цвет рамки'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {viewMode === 'colors' && getSelectedSeriesData()?.colors.map((color) => (
                <a 
                  href={color.url || `/product/${selectedSeries}/${color.id}`} 
                  key={color.id}
                  className="block group"
                >
                  <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-4 flex items-center justify-center">
                      <div className={`relative mx-auto ${
                        selectedSeries === 'info-sockets' ? 'w-28 h-28 sm:w-52 sm:h-52'
                        : selectedSeries === 'w55' ? 'w-28 h-28 sm:w-40 sm:h-40'
                        : 'w-24 h-24 sm:w-28 sm:h-28' 
                      }`}>
                        <Image 
                          src={color.image}
                          alt={color.name}
                          layout="fill"
                          objectFit="contain"
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                    <div className="p-3 text-center bg-gray-50 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800 truncate">
                        {color.name}
                      </h3>
                    </div>
                  </div>
                </a>
              ))}

              {viewMode === 'frames' && getSelectedSeriesData()?.colors.map((color, index) => {
                // Итерируем по 'colors', но берем данные из 'frames' по индексу
                const seriesData = getSelectedSeriesData();
                const frame = seriesData?.frames?.[index]; // Получаем рамку по индексу цвета

                if (!frame) {
                  // Если для этого индекса нет рамки, ничего не рендерим
                  // или можно отрендерить пустой блок для сохранения сетки: return <div key={`placeholder-${color.id}`}></div>;
                  return null; 
                }

                // Рендерим элемент рамки
                return (
                  <a 
                    href={frame.url || '#'} // Используем URL рамки
                    key={frame.id}          // Используем ID рамки
                    className="block group"
                  >
                    <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="p-4 flex items-center justify-center">
                        {/* Размер для рамок (можно настроить отдельно, если нужно) */}
                        <div className={`relative mx-auto w-28 h-28 sm:w-32 sm:h-32`}>
                          <Image 
                            src={frame.image}    // Изображение рамки
                            alt={frame.name}     // Имя рамки
                            layout="fill"
                            objectFit="contain"
                            className="transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>
                      <div className="p-3 text-center bg-gray-50 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-800 truncate">
                          {frame.name} {/* Имя рамки */}
                        </h3>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Отображение серий выбранного бренда */
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-6 text-center text-white">Выберите серию</h2>
          
          {filteredSeries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {filteredSeries.map((series) => (
                <div 
                  key={series.id}
                  className="block group cursor-pointer"
                  onClick={() => {
                    // Первые три серии Donel ведут на /Configurator
                    if (series.id === 'r98') {
                      window.location.href = '/Configurator';
                    } else if (series.id === 'r98-metal') {
                      window.location.href = '/Configurator2';
                    } else {
                      selectSeries(series.id);
                    }
                  }}
                >
                  <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-4 flex items-center justify-center">
                      <div className={`relative mx-auto ${selectedBrand === 'werkel' ? 'w-28 h-28 sm:w-32 sm:h-32' : 'w-24 h-24 sm:w-28 sm:h-28'}`}>
                        <Image 
                          src={series.image}
                          alt={series.name}
                          layout="fill"
                          objectFit="contain"
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                    <div className="p-3 text-center bg-gray-50 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800 truncate">
                        {series.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white p-8 bg-white/5 rounded-lg">
              Нет доступных серий для выбранного бренда
            </div>
          )}
        </div>
      )}
   
    </div>
  );
};

export default AllSeriesPage;