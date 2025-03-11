import SwiperCore, { EffectCoverflow, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.min.css";

SwiperCore.use([EffectCoverflow, Pagination]);

export const Slider = (props) => {
  const length = parseInt(props.length);

  const generateElements = () => {
    const slides = [];
    for (let i = 1; i <= length; i++) {
      const elementName = `element${i}`;
      slides.push(
        <>
          <SwiperSlide key={i}>{props[elementName]}</SwiperSlide>
          <div></div>
        </>
      );
    }
    return slides;
  };

  const slideElements = generateElements();

  return (
    <Swiper
      effect={"coverflow"}
      autoHeight={true}
      grabCursor={true}
      observer={true}
      observeParents={true}
      centeredSlides={true}
      slidesPerView={1}
      coverflowEffect={{
        rotate: 10,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
      }}
      pagination={{ clickable: true }}
      className="XGSwiper"
    >
      {slideElements}
    </Swiper>
  );
};
