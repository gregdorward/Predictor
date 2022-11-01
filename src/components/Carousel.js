import { getThemeProps } from "@material-ui/styles";
import SwiperCore, { EffectCoverflow, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.min.css";

SwiperCore.use([EffectCoverflow, Pagination]);

export const Slider = (props) => {
  return (
    <Swiper
      effect={"coverflow"}
      autoHeight={true}
      grabCursor={true}
      centeredSlides={true}
      slidesPerView={1}
      coverflowEffect={{
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
      }}
      pagination={true}
      className="mySwiper"
    >
      <SwiperSlide>
       {props.element}
      </SwiperSlide>
      <SwiperSlide>
      {props.element2}
      </SwiperSlide>
      <SwiperSlide>
      {props.element3}
      </SwiperSlide>
    </Swiper>
  );
};
