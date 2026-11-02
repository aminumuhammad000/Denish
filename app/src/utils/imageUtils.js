import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';

export const isInvalidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  if (trimmed === '') return true;
  if (trimmed.startsWith('blob:')) return true;
  if (trimmed.startsWith('file://')) return true;
  if (trimmed.includes('v1717410000/suya.jpg')) return true; // known broken image link
  if (trimmed.includes('via.placeholder.com') || trimmed.includes('placeholder.com')) return true;
  if (trimmed.includes('photo-1548839140-29a749e1bc4e')) return true;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) return true;
  return false;
};

export const getFoodFallbackImage = (item, defaultFallback) => {
  const name = (typeof item === 'string' ? item : item?.name || '').toLowerCase();
  const category = (item?.category || '').toLowerCase();
  const desc = (item?.description || item?.sub || '').toLowerCase();
  const combined = `${name} ${category} ${desc}`;

  // Water
  if (combined.includes('water')) {
    return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80';
  }

  // Suya & Grills
  if (combined.includes('suya') || combined.includes('grill') || combined.includes('barbecue') || combined.includes('skewer')) {
    return 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80';
  }

  // Waina & Traditional Snacks
  if (combined.includes('wain') || combined.includes('masa') || combined.includes('puff puff') || combined.includes('pancake')) {
    return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80';
  }

  // Wine
  if (combined.includes('wine')) {
    return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80';
  }

  // Drinks & Juices
  if (combined.includes('drink') || combined.includes('juice') || combined.includes('chapman') || combined.includes('smoothie') || combined.includes('beverage')) {
    return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80';
  }

  // Soups & Stews
  if (combined.includes('soup') || combined.includes('stew') || combined.includes('egusi') || combined.includes('swallow') || combined.includes('amala') || combined.includes('adequas')) {
    return 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80';
  }

  // Rice dishes
  if (combined.includes('rice') || combined.includes('jollof') || combined.includes('fried rice')) {
    return 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&q=80';
  }

  // Fruits
  if (combined.includes('fruit') || combined.includes('mango') || combined.includes('pineapple') || combined.includes('watermelon') || combined.includes('salad')) {
    return 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80';
  }

  // Snacks & pastries
  if (combined.includes('snack') || combined.includes('pie') || combined.includes('pastry') || combined.includes('burger') || combined.includes('shawarma')) {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80';
  }

  return defaultFallback || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80';
};

export const getItemImageUrl = (item, defaultFallback) => {
  const img = item?.image || (typeof item === 'string' ? item : null);
  if (!isInvalidImageUrl(img)) {
    return img;
  }
  return getFoodFallbackImage(item, defaultFallback);
};

export const isDrinkItem = (item) => {
  if (!item) return false;
  const cat = (item.category || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  const desc = (item.description || item.sub || '').toLowerCase();

  const drinkKeywords = [
    'drink', 'water', 'beverage', 'juice', 'soda', 'wine', 'beer', 
    'chapman', 'smoothie', 'zobo', 'kunu', 'tea', 'coffee', 'cocktail', 
    'mocktail', 'shake', 'boba', 'malt', 'cider', 'liquor', 'alcohol',
    'yoghurt', 'yogurt', 'milk', 'fanta', 'coke', 'pepsi', 'sprite'
  ];

  return drinkKeywords.some(kw => cat.includes(kw) || name.includes(kw) || desc.includes(kw));
};

export const ItemImage = ({ item, style, defaultFallback, resizeMode = 'cover', ...props }) => {
  const primaryUrl = getItemImageUrl(item, defaultFallback);
  const fallbackUrl = getFoodFallbackImage(item, defaultFallback);
  const [currentUri, setCurrentUri] = useState(primaryUrl);

  const keyIdentifier = typeof item === 'string' 
    ? item 
    : `${item?._id || item?.id || ''}-${item?.image || ''}-${item?.name || ''}`;

  useEffect(() => {
    setCurrentUri(getItemImageUrl(item, defaultFallback));
  }, [keyIdentifier]);

  const handleError = () => {
    if (currentUri !== fallbackUrl) {
      setCurrentUri(fallbackUrl);
    } else {
      setCurrentUri('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80');
    }
  };

  return (
    <Image
      source={{ uri: currentUri }}
      style={style}
      resizeMode={resizeMode}
      onError={handleError}
      {...props}
    />
  );
};
