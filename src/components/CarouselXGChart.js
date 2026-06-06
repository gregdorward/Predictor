import { useRef, useEffect, useCallback } from "react";
import SwiperCore, { EffectCoverflow, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.min.css";

SwiperCore.use([EffectCoverflow, Pagination]);

function SlideResizeObserver({ children, onResize }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(() => {
      onResize();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [onResize]);

  return <div ref={ref}>{children}</div>;
}

export const Slider = (props) => {
  const length = parseInt(props.length, 10);
  const swiperRef = useRef(null);

  const updateSwiperHeight = useCallback(() => {
    const swiper = swiperRef.current;
    if (swiper?.updateAutoHeight) {
      swiper.updateAutoHeight(0);
    }
  }, []);

  useEffect(() => {
    const timeouts = [50, 150, 400, 800, 1200].map((delay) =>
      window.setTimeout(updateSwiperHeight, delay)
    );
    return () => timeouts.forEach(window.clearTimeout);
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
      effect={"coverflow"}
      autoHeight={true}
      grabCursor={true}
      observer={true}
      observeParents={true}
      centeredSlides={true}
      slidesPerView={"auto"}
      spaceBetween={100}
      coverflowEffect={{
        rotate: 10,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
      }}
      pagination={{ clickable: true }}
      className="XGSwiper"
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
        updateSwiperHeight();
      }}
      onSlideChange={updateSwiperHeight}
    >
      {slides}
    </Swiper>
  );
};
