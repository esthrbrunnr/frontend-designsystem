import WindowEventListener from './events';

/**
 * LineClamper is a tool to allow line clamping on some elements
 *
 * @class LineClamper
 */
class LineClamper {
  private options: {
    selector: string,
  };

  private elements: any = null;
  private maxIterations: number = 20; // eslint-disable-line no-magic-numbers

  constructor() {
    this.options = {
      selector: '[data-lineclamp="true"]',
    };
  }

  /**
   * Initializing the line clamping and setting up for the first time
   *
   * @memberof LineClamper
   */
  public initLineClamping() {
    this.elements = document.querySelectorAll(this.options.selector);
    this.initEventListeners();
    this.setLineClamping();
  }


  /**
   * Is setting the line clamping for the found elements
   *
   * @private
   * @memberof LineClamper
   */
  private setLineClamping() {
    const defaultFallbackFunc = (el, maxLines, elHeight) => {
      let maxIt = this.maxIterations;
      let currentScrollHeight = 0;
      while (el.scrollHeight > elHeight && maxIt > 0) {
        if (el.scrollHeight !== currentScrollHeight) {
          maxIt = this.maxIterations;
          currentScrollHeight = el.scrollHeight;
        }
        el.textContent = el.textContent.replace(/\W*\s(\S)*$/, '...');
        maxIt -= 1;
      }
    };

    const useFallbackFunc = 'webkitLineClamp' in document.body.style
      ? undefined
      : defaultFallbackFunc;

    const truncateText = (el, maxLines, elHeight, elBottomPadding) => {
      if (!isNaN(maxLines)) { // eslint-disable-line
        if (useFallbackFunc) {
          useFallbackFunc(el, maxLines, elHeight);
        } else {
          el.style.overflow = 'hidden';
          el.style.paddingBottom = `${elBottomPadding}px`;
          el.style.textOverflow = 'ellipsis';
          el.style.webkitBoxOrient = 'vertical';
          el.style.display = '-webkit-box';
          el.style.webkitLineClamp = maxLines ? maxLines : ''; // eslint-disable-line
        }
      }
    };

    if (this.elements.length > 0) {
      this.elements.forEach((element) => {
        if (!element.hasAttribute('data-line-clamped')) {
          element.setAttribute('title', element.innerText.trim());
          element.setAttribute('data-content-before', element.innerHTML.trim());
          element.setAttribute('data-line-clamped', 'true');
        } else {
          element.innerHTML = element.getAttribute('data-content-before');
        }
        let elementHeight = parseInt(window.getComputedStyle(element).getPropertyValue('max-height'), 10);
        if (isNaN(elementHeight)) {// eslint-disable-line
          elementHeight = parseInt(window.getComputedStyle(element).getPropertyValue('height'), 10);
        }
        const computedLineHeight = parseInt(window.getComputedStyle(element).getPropertyValue('line-height'), 10);
        const computedFontSize = parseInt(window.getComputedStyle(element).getPropertyValue('font-size'), 10);
        const lines = Math.floor(elementHeight / computedLineHeight);
        let bottomFontPadding = 0;
        if (computedLineHeight / computedFontSize < 1.1) { // eslint-disable-line
          bottomFontPadding = 0.1 * computedLineHeight; // eslint-disable-line
        }
        truncateText(element, lines, elementHeight, bottomFontPadding);
      });
    }
  }

  /**
   * Update line clamping, after resize or dom changes
   *
   * @memberof LineClamper
   */
  public updateLineClamping() {
    this.setLineClamping();
  }

  /**
   * Initializing the event listeners
   *
   * @private
   * @memberof LineClamper
   */
  private initEventListeners() {
    (<any>WindowEventListener).addDebouncedResizeListener(() => {
      this.updateLineClamping();
    }, 'update-line-clamping');
  }
}

export default LineClamper;
