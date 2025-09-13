import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const SeriesLayout = () => {
  const series = [
    {
      name: 'Серия Werkel',
      image: '/images/series/seriswerkel.png',
      href: '/ElektroustnovohneIzdely/Werkel',
      className: 'col-span-1 md:col-span-6 md:row-span-2 h-64 md:h-full',
      titleClass: 'text-lg md:text-2xl',
      top: 'top-4 md:top-6',
      left: 'left-4 md:left-6',
    },
    {
      name: 'Серия Voltum',
      image: '/images/series/serisvoltum.png',
      href: '/ElektroustnovohneIzdely/Voltum',
      className: 'col-span-1 md:col-span-3 h-64 md:h-full',
      titleClass: 'text-base md:text-xl',
      top: 'top-3 md:top-4',
      left: 'left-3 md:left-4',
    },
  ];

  return (
    <>
      <Head>
        <title>Купить розетки и выключатели в Москве | Электроустановочные изделия Donel, Werkel, Voltum</title>
        <meta name="description" content="Купить розетки и выключатели в Москве по выгодным ценам. Широкий выбор электроустановочных изделий от Donel, Werkel, Voltum. Встраиваемые, накладные, ретро серии. Доставка по России." />
        <meta name="keywords" content="купить розетки выключатели москва, электроустановочные изделия, розетки Donel Werkel Voltum, выключатели купить, встраиваемые розетки, накладные выключатели, ретро розетки, интернет магазин электрики" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Купить розетки и выключатели в Москве - Donel, Werkel, Voltum" />
        <meta property="og:description" content="Купить розетки и выключатели в Москве по выгодным ценам. Широкий выбор электроустановочных изделий от ведущих производителей. Доставка по России." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/categories/vstarivaevyseriycategory.png" />
      </Head>

      <div className="min-h-screen max-w-7xl mx-auto mt-24 md:mt-0 bg-white text-black font-sans">
        {/* Header */}
        <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 ">
          <h1 className="text-3xl md:text-7xl font-bold tracking-wide">
            Электроустановочные изделия
          </h1>
          <span className="text-1xl max-lg:hidden md:text-sm font-bold tracking-wide">
            MORESVET
          </span>
        </div>

        {/* Grid Layout */}
        <div className="p-4 md:p-8">
          <div className="flex flex-col gap-4">
            {series.map((item, index) => (
              <Link key={index} href={item.href} className={`relative group cursor-pointer overflow-hidden rounded-xl w-full` }>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 md:h-96 object-cover transition-transform duration-500 group-hover:scale-105 rounded-xl"
                />
                <div className="absolute  inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                <div className={`absolute ${item.top} ${item.left}`}>
                  <h2 className={`text-white  font-bold  ${item.titleClass}`}>
                    {item.name}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SeriesLayout;
