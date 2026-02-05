// 📍 src/components/gallery/GalleryLightbox.tsx
// 买家秀 Lightbox 组件 (React Island)

import { useState, useEffect, useCallback } from 'react';

export interface GalleryImage {
  image: string;
  photographer?: string;
  location?: string;
}

interface GalleryLightboxProps {
  images: GalleryImage[];
}

export default function GalleryLightbox({ images }: GalleryLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 打开 Lightbox
  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    // 锁定滚动
    document.body.style.overflow = 'hidden';
  }, []);

  // 关闭 Lightbox
  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    // 恢复滚动
    document.body.style.overflow = '';
  }, []);

  // 上一张
  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  // 下一张
  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // 监听 gallery:open 事件
  useEffect(() => {
    const handleGalleryOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ index: number }>;
      openLightbox(customEvent.detail.index);
    };

    window.addEventListener('gallery:open', handleGalleryOpen);

    return () => {
      window.removeEventListener('gallery:open', handleGalleryOpen);
      // 清理滚动锁定
      document.body.style.overflow = '';
    };
  }, [openLightbox]);

  // 键盘导航
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case 'ArrowRight':
          goNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeLightbox, goPrev, goNext]);

  // 未打开时不渲染
  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      data-component="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* 遮罩层（点击关闭） */}
      <div
        className="absolute inset-0"
        onClick={closeLightbox}
        aria-hidden="true"
      />

      {/* 内容容器 */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
        {/* 关闭按钮 */}
        <button
          onClick={closeLightbox}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center group"
          aria-label="Close lightbox"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 图片计数器 */}
        <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>

        {/* 主图片 */}
        <div className="relative max-w-6xl max-h-[80vh] flex items-center justify-center">
          <img
            src={currentImage.image}
            alt={
              currentImage.photographer
                ? `Photo by ${currentImage.photographer}`
                : 'Gallery photo'
            }
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />

          {/* 左右切换按钮 */}
          {images.length > 1 && (
            <>
              {/* 左箭头 */}
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center group"
                aria-label="Previous image"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* 右箭头 */}
              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center group"
                aria-label="Next image"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* 图片信息 */}
        {(currentImage.photographer || currentImage.location) && (
          <div className="mt-6 text-center">
            {currentImage.photographer && (
              <p className="text-white text-base font-medium mb-1">
                <span className="opacity-70">Photo by</span>{' '}
                {currentImage.photographer}
              </p>
            )}
            {currentImage.location && (
              <p className="text-white/70 text-sm flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                {currentImage.location}
              </p>
            )}
          </div>
        )}

        {/* 键盘提示（仅桌面） */}
        <div className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
          Use arrow keys to navigate • ESC to close
        </div>
      </div>
    </div>
  );
}
