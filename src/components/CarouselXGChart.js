import { useRef, useEffect, useCallback } from "react";
import SwiperCore, { Controller, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.min.css";

SwiperCore.use([Pagination, Controller]);

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
  const paginationRef = useRef(null);
  const showPagination = props.showPagination !== false;
  const paginationPlacement = props.paginationPlacement || "bottom";

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

  useEffect(() => {
    const controlled = swiperRef.current;
    const controller = props.controllerSwiper;
    if (!controlled || !controller || controlled.destroyed || controller.destroyed) {
      return;
    }
    try {
      controlled.controller.control = controller;
    } catch (error) {
      // Controller can fail during teardown.
    }
  }, [props.controllerSwiper]);

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

  const shellClass =
    paginationPlacement === "top"
      ? "XGSwiperShell XGSwiperShell--paginationTop"
      : "XGSwiperShell";

  return (
    <div className={shellClass}>
      {showPagination && paginationPlacement === "top" && (
        <div
          ref={paginationRef}
          className="swiper-pagination swiper-pagination-clickable swiper-pagination-bullets XGSwiper__paginationTop"
        />
      )}
      <Swiper
        autoHeight={true}
        grabCursor={true}
        observer={true}
        observeParents={true}
        slidesPerView={1}
        spaceBetween={0}
        pagination={showPagination ? { clickable: true } : false}
        className={props.swiperClassName || "XGSwiper"}
        onBeforeInit={(swiper) => {
          if (showPagination && paginationPlacement === "top" && paginationRef.current) {
            swiper.params.pagination.el = paginationRef.current;
            swiper.params.pagination.clickable = true;
          }
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          if (typeof props.onSwiperInstance === "function") {
            props.onSwiperInstance(swiper);
          }
          updateSwiperHeight();
        }}
        onSlideChange={updateSwiperHeight}
        onSlideChangeTransitionEnd={updateSwiperHeight}
      >
        {slides}
      </Swiper>
      {props.belowWrapper ? (
        <div className="XGSwiper__belowWrapper">{props.belowWrapper}</div>
      ) : null}
    </div>
  );
};
