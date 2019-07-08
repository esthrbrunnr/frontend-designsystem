import loadSvgSprites from '@unic/estatico-svgsprite/lib/loader';
import WindowEventListener from './helpers/events';
import './helpers/modernizrrc';
import FontLoader from './helpers/fontloader';
import Helper from './helpers/helper';
import namespace from './helpers/namespace';
import LineClamper from './helpers/lineclamper';
import FlyingFocus from './helpers/flyingfocus';
import AssetLoader from './helpers/assetloader';

window[namespace] = {
  data: {}, // Content data
  options: {}, // Module options
  scriptLoader: new AssetLoader('data-script-main', 'script'),
  fontLoader: new FontLoader(),
  helpers: new Helper(),
  lineClamper: new LineClamper(),
  flyingFocus: new FlyingFocus(),
};

document.addEventListener('DOMContentLoaded', loadSvgSprites);
document.addEventListener('DOMContentLoaded', () => {
  (<any>window).estatico.lineClamper.initLineClamping();
  const adjustScrollbarWidth = () => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-wd', `${scrollBarWidth}px`);
  };
  (<any>WindowEventListener).addDebouncedResizeListener(() => {
    adjustScrollbarWidth();
  }, 'update-scrollbar-handling');
  adjustScrollbarWidth();
});
document.addEventListener('DOMContentLoaded', () => { (<any>window).estatico.flyingFocus.initFlyingFocus(); });
