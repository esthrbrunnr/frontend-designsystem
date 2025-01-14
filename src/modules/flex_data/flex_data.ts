/*!
 * FlexData
 *
 * @author
 * @copyright
 */
import Module from '../../assets/js/helpers/module';
import { getAllURLParams, getURLParam } from '../../assets/js/helpers/common';
import { template } from 'lodash';
import Table from '../table/table';
import Select from '../select/select';
import namespace from '../../assets/js/helpers/namespace';
import Pagination from '../pagination/pagination';
import Accordion from '../accordion/accordion';
import Datepicker from '../datepicker/datepicker';

class FlexData extends Module {
  public ui: {
    element: HTMLDivElement,
    results: HTMLDivElement,
    resultsTemplate: HTMLScriptElement,
    resultsGeneric: HTMLDivElement,
    genericSort: HTMLDivElement,
    genericSortDropdown: HTMLDivElement,
    genericSortButton: HTMLButtonElement,
    resultsGenericTitle: HTMLHeadingElement,
    resultsTable: HTMLTableElement,
    resultsTableBody: HTMLElement,
    resultsTableTitle: HTMLHeadingElement,
    resultsTableColumns: HTMLElement[],
    form: HTMLFormElement,
    pagination: HTMLDivElement,
    notification: HTMLDivElement,
    paginationInput: HTMLInputElement,
    submitButton: HTMLButtonElement,
    clearButton: HTMLButtonElement,
    includeRepealed: HTMLInputElement,
  };
  public options: any;
  public dataUrl: string;
  private dataIdle: boolean;
  private currentUrl: string;
  private order: string;
  private orderBy: string;
  private paginationInteraction: boolean;

  constructor($element: any, data: Object, options: Object) {
    const defaultData = {
    };
    const defaultOptions = {
      initDelay: 300,
      domSelectors: {
        results: '.mdl-flex-data__results',
        resultsGeneric: '.mdl-flex-data__results .mdl-flex-data__results-generic',
        resultsGenericTitle: '.mdl-flex-data__results .mdl-flex-data__results-title',
        genericSort: '.mdl-flex-data__generic-sort',
        genericSortDropdown: '.mdl-flex-data__generic-sort .mdl-context_menu',
        genericSortButton: '.mdl-flex-data__generic-sort-dropdown',
        resultsTable: '.mdl-table',
        resultsTableBody: '.mdl-table .mdl-table__body',
        resultsTableColumns: '.mdl-table [data-column-name]',
        resultsTableTitle: '.mdl-table .mdl-table__title',
        resultsTemplate: '[data-flex-template]',
        form: 'form',
        submitButton: 'form [data-search-flex]',
        clearButton: 'form [data-clear-flex]',
        pagination: '.mdl-pagination',
        paginationInput: '.mdl-pagination input',
        notification: '.mdl-flex-data__notification',
        includeRepealed: '[name="includeRepealedEnactments"]',
      },
      stateClasses: {
        loading: 'mdl-flex-data--loading',
      },
    };
    super($element, defaultData, defaultOptions, data, options);
    this.dataUrl = this.ui.element.getAttribute('data-source');
    this.dataIdle = true;
    this.paginationInteraction = false;
    this.order = '';
    this.orderBy = '';
    this.initUi();
    this.initEventListeners();

    window.sessionStorage.removeItem('origin');
  }

  static get events() {
    return {
      // eventname: `eventname.${ FlexData.name }.${  }`
    };
  }

  /**
   * Event listeners initialisation
   */
  initEventListeners() {
    if (this.ui.resultsTable) {
      this.ui.resultsTable.addEventListener(Table.events.sort, this.onSortResults.bind(this));
    }
    this.ui.submitButton.addEventListener('click', this.onSearchResults.bind(this));
    this.ui.clearButton.addEventListener('click', this.onClearResults.bind(this));
    this.ui.form.addEventListener('keypress', (event: any) => {
      const active = document.activeElement;
      if (event.key === 'Enter' && (active.tagName !== 'BUTTON' || active.hasAttribute('data-search-flex'))) {
        event.preventDefault();
        this.ui.submitButton.click();
        return false;
      }
      return true;
    });

    this.ui.form.querySelectorAll('input').forEach((inp) => {
      if (inp.type === 'text') {
        inp.addEventListener('keyup', (event) => {
          if ((<any>event.target).value.length > 0) {
            this.ui.clearButton.classList.remove('hidden');
          }
        });
      } else {
        inp.addEventListener('change', () => {
          this.ui.clearButton.classList.remove('hidden');
        });
      }
    });
    // -----------------------------------------------
    // Listen to pagination change event
    this.ui.pagination.addEventListener(Pagination.events.change, () => {
      this.loadResults(this.paginationInteraction);
    });
    this.ui.pagination.addEventListener(Pagination.events.interaction, () => {
      this.paginationInteraction = true;
    });
    // -----------------------------------------------
    // Listen to sort-dropdown events
    if (this.ui.genericSortButton) {
      this.ui.genericSortButton.addEventListener('click', () => {
        const newState = this.ui.genericSortButton.getAttribute('aria-expanded') === 'false' ? 'true' : 'false';
        this.ui.genericSortDropdown.classList.toggle('visible');
        this.ui.genericSortButton.setAttribute('aria-expanded', newState);
      });
      this.ui.genericSortButton.addEventListener('keydown', (event) => {
        if (event.key === 'Esc' || event.key === 'Escape') {
          this.closeSortDropdown();
        }
      });
      this.ui.genericSortDropdown.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => {
          this.order = button.getAttribute('data-sort-direction');
          this.orderBy = button.getAttribute('data-sort-column');
          this.updateSortDropdown(button);
          this.closeSortDropdown();
          this.ui.paginationInput.value = '1';
          this.loadResults();
        });
        button.addEventListener('keydown', (event) => {
          if (event.key === 'Esc' || event.key === 'Escape') {
            this.closeSortDropdown();
          }
        });
      });
    }
    const sortParamElemet = this.ui.resultsTable ? this.ui.resultsTable : this.ui.resultsGeneric;
    this.order = sortParamElemet.getAttribute('data-sort-direction');
    this.orderBy = sortParamElemet.getAttribute('data-sort-column');
    const initialLoad = this.ui.element.hasAttribute('data-initial-load');
    if (getAllURLParams()['page'] || initialLoad) { // eslint-disable-line
      this.updateViewFromURLParams();
      setTimeout(() => {
        if (this.isVisible()) {
          this.loadResults(false, true);
        }
      }, this.options.initDelay);
    }

    // EventListener to set localstorage
    this.eventDelegate.on('click', `${this.options.domSelectors.results} .mdl-table__cell a`, () => {
      window.sessionStorage.setItem('origin', window.location.href);
    });
  }

  /**
   * Search for data
   */
  onSearchResults() {
    // Set the sort element if present
    if (this.ui.genericSortDropdown) {
      let sortSelector = `[data-sort-column="${this.orderBy}"]`;
      if (this.orderBy !== 'relevance') {
        sortSelector += `[data-sort-direction="${this.order}"]`;
      }
      const sortSetting = this.ui.genericSortDropdown.querySelector(sortSelector);
      this.updateSortDropdown(sortSetting);
    }
    this.ui.paginationInput.value = '1';
    this.loadResults();
  }

  /**
   * Clear search entries
   */
  onClearResults() {
    this.ui.clearButton.classList.add('hidden');

    this.ui.form.setAttribute('is-reset', 'true');

    this.ui.form.reset();
    this.ui.form.querySelectorAll('.mdl-select').forEach((select: HTMLElement) => {
      select.dispatchEvent(new CustomEvent(Select.events.clear));

      // Disabled 2. select in case its a drilldown-select
      if (select.hasAttribute('data-drilldown-secondary')) {
        select
          .dispatchEvent(new CustomEvent(Select.events.disable, { detail: { disabled: true } }));
      }
    });
    this.ui.form.querySelectorAll('.mdl-accordion').forEach((accordion: HTMLDivElement) => {
      accordion.dispatchEvent(new CustomEvent(Accordion.events.clearSubheads));
    });
    this.ui.form.querySelectorAll('.mdl-datepicker').forEach((datepicker: HTMLDivElement) => {
      datepicker.dispatchEvent(new CustomEvent(Datepicker.events.clear));
    });
    this.ui.results.classList.add('initially-hidden');
    this.ui.pagination.classList.add('hidden');
    const initialLoad = this.ui.element.hasAttribute('data-initial-load');
    if (initialLoad) {
      this.loadResults();
    }

    this.ui.form.removeAttribute('is-reset');
    // Clear url
    const baseUrl = this.getBaseUrl();
    window.history.pushState({}, document.title, baseUrl);
  }

  /**
   * Handle sort event on table
   * @param event
   */
  onSortResults(event) {
    const { column, direction } = event.detail;
    const newDirection = direction === 'ascending' ? 'descending' : 'ascending';
    const eventDetail = {
      detail: {
        column: column, // eslint-disable-line
        direction: newDirection,
      },
    };
    this.orderBy = column;
    this.order = newDirection;
    this.ui.resultsTable.dispatchEvent(new CustomEvent(Table.events.sortColumn, eventDetail));
    this.ui.paginationInput.value = '1';
    this.loadResults();
  }

  /**
   * Close sort dropdown
   */
  private closeSortDropdown() {
    this.ui.genericSortDropdown.classList.remove('visible');
    this.ui.genericSortButton.setAttribute('aria-expanded', 'false');
  }

  /**
   * Update sort dropdown
   *
   * @param sortSetting Element
   */
  private updateSortDropdown(sortSetting: Element) {
    this.ui.genericSortDropdown.querySelectorAll('button').forEach((button) => {
      button.classList.remove('atm-context_menu_item--selected');
      button.setAttribute('aria-pressed', 'false');
    });
    sortSetting.classList.add('atm-context_menu_item--selected');
    sortSetting.setAttribute('aria-pressed', 'true');
    this.ui.genericSortButton.querySelector<HTMLSpanElement>('.atm-form_input__trigger-value').innerText = sortSetting.querySelector('span').innerText;
  }

  /**
   * Load results
   *
   * @param scroll boolean
   */
  private loadResults(scroll = false, replaceState = false) {
    this.paginationInteraction = false;
    if (this.dataIdle) {
      this.dataIdle = false;
      if (scroll) {
        this.scrollTop();
      }
      this.fetchData((jsonData) => {
        this.ui.results.classList.remove('initially-hidden');
        this.ui.pagination.classList.add('hidden');
        if (jsonData.error) {
          this.ui.notification.classList.remove('hidden');
          this.ui.results.classList.add('initially-hidden');
          if (this.ui.genericSort) {
            this.ui.genericSort.classList.add('hidden');
          }
          this.dataIdle = true;
          return;
        }
        this.ui.clearButton.classList.remove('hidden');
        if (jsonData.numberOfResultPages > 1) {
          this.ui.pagination.classList.remove('hidden');
        }
        this.ui.pagination.dispatchEvent(new CustomEvent(Pagination
          .events.setPageCount, { detail: jsonData.numberOfResultPages }));
        const canonicalUrl = `${this.getBaseUrl()}?${this.currentUrl.split('?')[1]}`;
        let prevUrl = '';
        if (parseInt(this.ui.paginationInput.value, 10) > 1) {
          prevUrl = `${this.getBaseUrl()}?${this.currentUrl.split('?')[1].replace(/page=(0|[1-9][0-9]*)/, `page=${parseInt(this.ui.paginationInput.value, 10) - 1}`)}`;
        }
        let nextUrl = '';
        if (parseInt(this.ui.paginationInput.value, 10) < jsonData.numberOfResultPages) {
          nextUrl = `${this.getBaseUrl()}?${this.currentUrl.split('?')[1].replace(/page=(0|[1-9][0-9]*)/, `page=${parseInt(this.ui.paginationInput.value, 10) + 1}`)}`;
        }
        this.ui.pagination.dispatchEvent(new CustomEvent(Pagination.events.setCanonicalUrls,
          { detail: { prev: prevUrl, next: nextUrl } }));
        // update canonical links
        this.upsertLinkRel('prev', prevUrl);
        this.upsertLinkRel('next', nextUrl);
        this.upsertLinkRel('canonical', canonicalUrl);
        this.populateResultList(jsonData);
        this.updateFlyingFocus(0);
        this.dispatchVerticalResizeEvent(100); // eslint-disable-line
        if (scroll) {
          this.scrollTop();
        }
        this.dataIdle = true;
      }, replaceState);
    }
  }

  /**
   * Scroll to top
   */
  scrollTop() {
    setTimeout(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const rect = this.ui.element.getBoundingClientRect();
      window.scroll(0, rect.top + scrollTop);
    }, 0);
  }

  /**
   * Scroll to bottom
   */
  scrollBottom() {
    setTimeout(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const rect = this.ui.pagination.getBoundingClientRect();
      const elementOffset = rect.height * 2; // eslint-disable-line
      window.scroll(0, rect.top + scrollTop - window.innerHeight + elementOffset);
    }, 0);
  }

  /**
   * Clear and add results
   * @param jsonData
   */
  populateResultList(jsonData) {
    let removeColumnRepealed = false;
    let resultsTitle = '';

    if (this.ui.includeRepealed) {
      removeColumnRepealed = !this.ui.includeRepealed.checked;
    }

    // no results
    if (!jsonData || Object.keys(jsonData).length === 0) {
      resultsTitle = this.ui.results.getAttribute('data-no-results-title');
      if (this.ui.resultsTableBody) {
        this.ui.resultsTableBody.innerHTML = '';
      } else if (this.ui.resultsGeneric) {
        this.ui.resultsGeneric.innerHTML = '';
      }

    // too many results
    } else if (jsonData.moreSearchResultsThanAllowed) {
      resultsTitle = this.ui.results.getAttribute('data-result-count-title-more')
        .replace('%1', jsonData.numberOfResults);

    // full list of results
    } else {
      resultsTitle = this.ui.results.getAttribute('data-result-count-title')
        .replace('%1', jsonData.numberOfResults);
    }

    if (jsonData && jsonData.numberOfResultPages > 1) {
      this.ui.pagination.setAttribute('data-pagecount', jsonData.numberOfResultPages);
      this.ui.pagination.querySelector('.mdl-pagination__page-count > span').innerHTML = jsonData.numberOfResultPages;
      this.ui.pagination.classList.remove('hidden');
    } else {
      this.ui.pagination.classList.add('hidden');
    }

    // fill table date if present
    if (this.ui.resultsTable) {
      this.ui.resultsTableBody.innerHTML = '';
      this.ui.resultsTable.classList.remove('visible');
      this.ui.resultsTableTitle.innerText = resultsTitle;
      if (jsonData.data) {
        this.ui.resultsTable.classList.add('visible');
        jsonData.data.forEach((item) => {
          const tr = document.createElement('tr');
          tr.classList.add('mdl-table__row');

          // Added searchhighlight to link href CZHDEV-3007
          let searchHighlightQuery = '';
          const searchInputValue = (<HTMLInputElement>(this.ui.form.querySelector('input[type="text"]'))).value;
          if (searchInputValue) {
            searchHighlightQuery = `?search=${encodeURIComponent(searchInputValue)}`;
          }

          const props = {
            link: `${item.link}${searchHighlightQuery}`,
          };
          const resultsTableColumns = this.ui.resultsTableColumns.length
            ? this.ui.resultsTableColumns : [this.ui.resultsTableColumns];
          resultsTableColumns.forEach((col, index) => {
            const colName = col.getAttribute('data-column-name');
            props[`text${index}`] = item[colName];
          });
          tr.innerHTML = this.markupFromTemplate(this.ui.resultsTemplate.innerHTML, props);
          tr.addEventListener('click', (event) => {
            const a = tr.querySelector('a');

            if (event.ctrlKey || event.metaKey) {
              window.open(a.getAttribute('href'), '_blank');
            } else {
              a.click();
            }
          });
          this.ui.resultsTableBody.appendChild(tr);
        });
      }
      // CZHDEV-2355
      if (removeColumnRepealed) {
        const { rows } = this.ui.resultsTable.querySelector('table');
        let cellIndex = null;
        for (let x = 0; x < rows[0].cells.length; x += 1) {
          const cell = rows[0].cells[x];
          if (cell.dataset.columnName === 'withdrawalDate') {
            cellIndex = x;
            cell.style.display = 'none';
          }
        }
        if (cellIndex) {
          for (let i = 1; i < rows.length; i += 1) {
            rows[i].cells[cellIndex].style.display = 'none';
          }
        }
      } else {
        const thWithdrawalDate = this.ui.resultsTable.querySelector('[data-column-name="withdrawalDate"]');

        if (thWithdrawalDate) {
          thWithdrawalDate.removeAttribute('style');
        }
      }
    }
    // fill generic results
    if (this.ui.resultsGeneric) {
      this.ui.resultsGenericTitle.innerText = resultsTitle;
      if (!jsonData || !jsonData.numberOfResults || jsonData.numberOfResults <= 0) {
        this.ui.genericSort.classList.add('hidden');
      } else {
        this.ui.genericSort.classList.remove('hidden');

        this.ui.resultsGeneric.innerHTML = '';
        this.ui.resultsGeneric.innerHTML = this
          .markupFromTemplate(this.ui.resultsTemplate.innerHTML, jsonData);
      }
    }
  }

  /**
   * Create markup with template and properties
   * @param scriptTemplate
   * @param props
   */
  private markupFromTemplate(scriptTemplate, props) {
    const compiled = template(scriptTemplate.replace(/this\./gm, 'self.')); // eslint-disable-line
    return compiled(props);
  }

  /**
   * Assemble URL from base url and filters
   */
  private constructUrl() {
    let resultUrl = this.dataUrl;

    const append = (key, value) => {
      if (value && value.length > 0) {
        resultUrl += resultUrl === this.dataUrl ? '?' : '&';
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            resultUrl += index > 0 ? '&' : '';
            resultUrl += `${key}=${encodeURIComponent(item)}`;
          });
        } else {
          resultUrl += `${key}=${encodeURIComponent(value)}`;
        }
      }
    };
    const formData = window[namespace].form.formToJSON(this.ui.form.elements);

    Object.keys(formData).forEach((key) => {
      append(key, formData[key]);
    });
    append('page', this.ui.paginationInput.value);
    append('order', this.order);
    append('orderBy', this.orderBy);

    // append has (for tabs)
    if (window.location.hash) {
      resultUrl += window.location.hash;
    }
    return resultUrl;
  }

  /**
   * Update from URL params
   */
  updateViewFromURLParams() {
    if (!this.isVisible()) {
      return;
    }
    const params = getAllURLParams();
    Object.keys(params).forEach((key) => {
      switch (key) {
        case 'page':
          setTimeout(() => {
            this.ui.pagination
              .dispatchEvent(new CustomEvent(Pagination.events.setPage, { detail: params[key] }));
          }, 0);
          break;
        case 'order':
          if (this.ui.resultsTable) {
            this.ui.resultsTable.setAttribute('data-sort-direction',
              params[key][0] === 'desc' ? 'descending' : 'ascending');
          }
          this.order = params[key][0]; // eslint-disable-line
          break;
        case 'orderBy':
          if (this.ui.resultsTable) {
            this.ui.resultsTable.setAttribute('data-sort-column', params[key][0]);
          }
          this.orderBy = params[key][0]; // eslint-disable-line
          break;
        default:
          this.ui.clearButton.classList.remove('hidden');
          setTimeout(() => {
            const selectedElements = this.ui.form.querySelectorAll(`input[name=${key}]`); // eslint-disable-line
            const values = params[key]; // eslint-disable-line
            if (selectedElements.length > 0) {
              const item = <HTMLInputElement>selectedElements[0];

              if (item.hasAttribute('data-select-option')) {
                // -----------
                // dropdown
                const payload = {
                  data: item.getAttribute('type') === 'radio' ? values[0] : values,
                  emit: true,
                };
                const module = item.closest('.mdl-select');
                if (module.hasAttribute('data-drilldown-secondary')) {
                  setTimeout(() => {
                    module
                      .dispatchEvent(new CustomEvent(Select.events.setValue, { detail: payload }));
                  }, 0);
                } else {
                  module
                    .dispatchEvent(new CustomEvent(Select.events.setValue, { detail: payload }));
                }
              } else if (item.classList.contains('flatpickr-input')) {
                // -----------
                // datepicker
                item.value = window[namespace].form.dateRangeFromUrlParam(values[0]); // eslint-disable-line
                item.classList.add('dirty');
                item.parentElement.parentElement.parentElement.classList.add('dirty');
              } else {
                // -----------
                // textfield or checkbox
                item.value = decodeURIComponent(values[0]); // eslint-disable-line
                item.classList.add('dirty');
                if (item.getAttribute('type') === 'checkbox') {
                  item.checked = true;
                }
              }
            }
          }, this.options.initDelay);
          break;
      }
    });

    // Set accordion subheads if present
    if (this.ui.form.querySelectorAll('.mdl-accordion').length) {
      setTimeout(() => {
        this.ui.form.querySelectorAll('.mdl-accordion').forEach((accordion: HTMLDivElement) => {
          accordion.dispatchEvent(new CustomEvent(Accordion.events.updateSubheads));
        });
      }, this.options.initDelay);
    }

    // Set the sort element if present
    if (this.ui.genericSortDropdown) {
      let sortSelector = `[data-sort-column="${this.orderBy}"]`;
      if (this.orderBy !== 'relevance') {
        sortSelector += `[data-sort-direction="${this.order}"]`;
      }
      const sortSetting = this.ui.genericSortDropdown.querySelector(sortSelector);
      this.updateSortDropdown(sortSetting);
    }
  }

  /**
   * Fetch teaser data
   * @param callback
   */
  async fetchData(callback: Function, replaceState = false) {
    this.ui.results.classList.add(this.options.stateClasses.loading);

    if (!window.fetch) {
      await import('whatwg-fetch');
    }
    this.currentUrl = this.constructUrl();
    return fetch(this.currentUrl)
      .then((response) => {
        if (response.status !== 200 && response.status !== 204 ) { // eslint-disable-line
          throw new Error('Error fetching resource!');
        }
        return response.status === 204 ? {} : response.json(); // eslint-disable-line
      })
      .then((response) => {
        if (response) {
          const wcmmode = getURLParam('wcmmode');
          const canonical = `${this.getBaseUrl()}?${this.currentUrl.split('?')[1]}${wcmmode ? '&wcmmode=' + wcmmode : ''}`; // eslint-disable-line
          if (replaceState) {
            if (history.state && history.state.url && history.state.url !== canonical) { // eslint-disable-line
              history.replaceState({url: canonical,}, null, canonical); // eslint-disable-line
            }
          } else {
            history.pushState({url: canonical,}, null, canonical); // eslint-disable-line
          }
          callback(response);
          this.ui.notification.classList.add('hidden');
        }
        this.ui.results.classList.remove(this.options.stateClasses.loading);
      })
      .catch((err) => {
        this.log('error', err);
        this.ui.results.classList.remove(this.options.stateClasses.loading);
        callback({ error: err });
      });
  }

  /**
   * Unbind events, remove data, custom teardown
   */
  destroy() {
    super.destroy();

    // Custom destroy actions go here
  }
}

export default FlexData;
