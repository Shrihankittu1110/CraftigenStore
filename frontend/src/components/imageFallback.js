const fallbackImage = "/img/products/candle.jpeg";

const useFallbackImage = (event) => {
  if (event.currentTarget.src.endsWith(fallbackImage)) return;
  event.currentTarget.src = fallbackImage;
};

export { fallbackImage, useFallbackImage };
