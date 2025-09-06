import React, { useEffect } from 'react';
import { ProductI } from '../types/interfaces';

interface Props {
  products?: ProductI[];
}

const CriticalPreloader: React.FC<Props> = ({ products = [] }) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !products || products.length === 0) return;

    const urls: string[] = products.slice(0, 3).map(p => {
      if (!p) return '';
      if (typeof p.imageAddresses === 'string') return p.imageAddresses as string;
      if (Array.isArray(p.imageAddresses) && p.imageAddresses.length > 0) return p.imageAddresses[0];
      if (typeof p.imageAddress === 'string') return p.imageAddress;
      if (Array.isArray(p.imageAddress) && p.imageAddress.length > 0) return p.imageAddress[0];
      return '';
    }).filter(Boolean) as string[];

    urls.forEach(src => {
      try {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      } catch (e) {
        // noop
      }
    });
  }, [products]);

  return null;
};

export default CriticalPreloader;


