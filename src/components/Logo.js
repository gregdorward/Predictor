import logoPng from './images/NewLogo.png';
import logoWebp from './images/NewLogo.webp';

const Logo = () => {
  return (
    <h1 className="logo-container">
      <picture>
        <source srcSet={logoWebp} type="image/webp" />
        <img src={logoPng} alt="Soccer Stats Hub logo" className="responsive-logo" fetchpriority="high" />
      </picture>
    </h1>
  );
};

export default Logo;