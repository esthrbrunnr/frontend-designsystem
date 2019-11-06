/*!
 * CookieControls
 *
 * @author
 * @copyright
 */
import Module from '../../assets/js/helpers/module';

class CookieControls extends Module {
  private daysToExpire: number;
  private cookieName: string;

  public ui: {
    element: HTMLDivElement,
    checkbox: HTMLInputElement,
  };

  public options: {
    domSelectors: {
      checkbox: string,
    },
    stateClasses: {}
  };

  constructor($element: any, data: Object, options: Object) {
    const defaultData = {
    };
    const defaultOptions = {
      domSelectors: {
        checkbox: '.atm-checkbox input',
      },
      stateClasses: {
        // activated: 'is-activated'
      },
    };

    super($element, defaultData, defaultOptions, data, options);
    const radix = 10;
    this.daysToExpire = parseInt(this.ui.element.dataset.expirydays, radix);
    this.cookieName = 'acceptYouTube';

    const match = document.cookie.match(new RegExp(`(^| )${this.cookieName}=([^;]+)`));
    if (match && match[2] === 'true') {
      this.log('YouTube cookie is accepted.');
      this.ui.checkbox.checked = true;
    } else {
      this.log('No YouTube cookie value found or its not accepted.');
    }

    this.initUi();
    this.initEventListeners();
  }

  static get events() {
    return {
      // eventname: `eventname.${ CookieControls.name }.${  }`
    };
  }

  /**
   * Event listeners initialisation
   */
  initEventListeners() {
    this.eventDelegate.on('click', this.options.domSelectors.checkbox, () => {
      if (this.ui.checkbox.checked) {
        document.cookie = `acceptYouTube=true; max-age=${this.getExpireDate()}; path=/`;
      } else {
        document.cookie = `acceptYouTube=true; max-age=${new Date()}; path=/`;
      }
    });
  }

  /**
   * Calculate the expire date for the cookie
   *
   * @return {string}
   */
  private getExpireDate():string {
    const date = new Date();
    const hoursADay = 24;
    const minsPerHour = 60;
    const secsPerMin = 60;
    const milliSecs = 1000;
    date.setTime(date.getTime()
      + this.daysToExpire * hoursADay * minsPerHour * secsPerMin * milliSecs);

    this.log(`Set cookie expirationtime to ${date.toUTCString()}`);
    return date.toUTCString();
  }

  /**
   * Unbind events, remove data, custom teardown
   */
  destroy() {
    super.destroy();

    // Custom destroy actions go here
  }
}

export default CookieControls;
