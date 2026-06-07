import { useRef, useEffect, useCallback } from "react";
import SwiperCore, { Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.min.css";

SwiperCore.use([Pagination]);

function SlideResizeObserver({ children, onResize }) {
  const ref = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(() => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(() => {
        onResize();
      });
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [onResize]);

  return <div ref={ref}>{children}</div>;
}

export const Slider = (props) => {
  const length = parseInt(props.length, 10);
  const swiperRef = useRef(null);

  const updateSwiperHeight = useCallback(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed || !swiper.params) {
      return;
    }

    try {
      swiper.updateAutoHeight(0);
      window.dispatchEvent(new Event("resize"));
    } catch (error) {
      // Swiper can throw if autoHeight runs during init/teardown.
    }
  }, []);

  useEffect(() => {
    const timeouts = [50, 150, 400, 800, 1200].map((delay) =>
      window.setTimeout(updateSwiperHeight, delay)
    );
    return () => {
      timeouts.forEach(window.clearTimeout);
      swiperRef.current = null;
    };
  }, [updateSwiperHeight, length]);

  const slides = [];
  for (let i = 1; i <= length; i++) {
    const elementName = `element${i}`;
    slides.push(
      <SwiperSlide key={i}>
        <SlideResizeObserver onResize={updateSwiperHeight}>
          {props[elementName]}
        </SlideResizeObserver>
      </SwiperSlide>
    );
  }

  return (
    <Swiper
      autoHeight={true}
      grabCursor={true}
      observer={true}
      observeParents={true}
      slidesPerView={1}
      spaceBetween={0}
      pagination={{ clickable: true }}
      className="XGSwiper"
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
        updateSwiperHeight();
      }}
      onSlideChange={updateSwiperHeight}
      onSlideChangeTransitionEnd={updateSwiperHeight}
    >
      {slides}
    </Swiper>
  );
};
