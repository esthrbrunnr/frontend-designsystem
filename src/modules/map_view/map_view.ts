/*!
 * MapView
 *
 * @author
 * @copyright
 */
import Module from '../../assets/js/helpers/module';
import * as wms from 'leaflet.wms';
import 'leaflet';
import 'leaflet.markercluster';

// @ts-ignore
const { L } = window;

/* eslint-disable no-magic-numbers */
const mapOptions: L.MapOptions = {
  crs: L.CRS.EPSG3857,
  maxBounds: L.latLngBounds(L.latLng(48, 5.8), L.latLng(45.6, 10.9)),
  maxBoundsViscosity: 0.5,
  center: L.latLng(47.3776662, 8.5365413),
  zoom: 12,
  maxZoom: 18,
  minZoom: 9,
  zoomAnimation: false,
  zoomControl: false,
  attributionControl: false,
};
/* eslint-enable no-magic-numbers */
const markerIcon = L.divIcon({ className: 'mdl-map_view__marker', iconSize: [0, 0] });
const markerIconHighlight = L.divIcon({ className: 'mdl-map_view__marker_highlight', iconSize: [0, 0] });
const userPosIcon = L.divIcon({ className: 'mdl-map_view__userposition', iconSize: [0, 0] });

interface MarkerEvent extends CustomEvent<{ idx: number}>{}

class MapView extends Module {
  public options: {
    domSelectors: {
      mapContainer: string,
      zoomInBtn: string,
      zoomOutBtn: string,
      centerBtn: string,
      markerProps: string,
      markerPropsLat: string,
      markerPropsLng: string,
    }
    stateClasses: {

    }
  };

  public ui: {
    element: Element,
    mapContainer: HTMLDivElement,
    zoomInBtn: HTMLElement,
    zoomOutBtn: HTMLElement,
    centerBtn: HTMLElement,
    inputHighlightIdx: HTMLInputElement,
    inputSelectIdx: HTMLInputElement,
  };

  private map: L.Map;
  private markers: L.Marker[];
  private userPosMarker: L.Marker;

  constructor($element: any, data: Object, options: Object) {
    const defaultData = {
    };
    const defaultOptions = {
      domSelectors: {
        mapContainer: '[data-map-view=map]',
        zoomInBtn: '[data-map-view=zoomInBtn]',
        zoomOutBtn: '[data-map-view=zoomOutBtn]',
        centerBtn: '[data-map-view=centerBtn]',
        markerProps: '[data-map-view=markerProps]',
        markerPropsLat: '[data-map-view=marker_lat]',
        markerPropsLng: '[data-map-view=marker_lng]',
        inputHighlightIdx: '[data-map-view=highlightIndex]',
        inputSelectIdx: '[data-map-view=selectIndex]',
      },
      stateClasses: {
        // activated: 'is-activated'
      },
    };

    super($element, defaultData, defaultOptions, data, options);

    this.initUi();
    this.initEventListeners();

    this.initMap();
  }

  static get events() {
    return {
      highlightMarker: `eventname.${MapView.name}.ext_marker_highlight`,
      markerMouseOver: `eventname.${MapView.name}.marker_mouseover`,
      fixMarker: `eventname.${MapView.name}.fix_marker`,
    };
  }

  /**
   * Event listeners initialisation
   */
  initEventListeners() {
    // Event listeners
    this.eventDelegate
      .on(MapView.events.fixMarker, this.onMarkerSelect.bind(this))
      .on('click', this.options.domSelectors.zoomInBtn, () => {
        this.map.zoomIn();
      })
      .on('click', this.options.domSelectors.zoomOutBtn, () => {
        this.map.zoomOut();
      })
      .on('click', this.options.domSelectors.centerBtn, () => {
        this.map.locate(
          // { setView: true } // TODO
        );
      });

    this.ui.mapContainer
      .addEventListener(MapView.events.highlightMarker, this.onExtMarkerHighlight.bind(this));
  }

  private onExtMarkerHighlight(ev: MarkerEvent): void {
    this.log('External marker highlight on marker idx = ', ev.detail.idx);
    const targetMarkerIdx = ev.detail.idx;
    if (targetMarkerIdx === -1) {
      this.markers.forEach(m => m.fire('mouseout'));
    } else if (targetMarkerIdx >= 0 && targetMarkerIdx < this.markers.length) {
      this.markers[targetMarkerIdx].fireEvent('mouseover');
    }
  }

  private onMarkerSelect(ev): void {
    this.log('Marker selected: ', ev);
  }

  private initMap(): void {
    const url = 'https://wms.zh.ch/ZHWEB?';
    this.map = new L.Map(this.ui.mapContainer, mapOptions);

    L.tileLayer.wms(url, {
      version: '1.3.0',
      format: 'image/png; mode=8bit',
      transparent: false,
      layers: 'ZHBase',
    }).addTo(this.map);

    wms.overlay(url, {
      version: '1.3.0',
      format: 'image/png; mode=8bit',
      transparent: true,
      layers: 'ZHLabels',
    }).addTo(this.map);

    if (this.ui.centerBtn) {
      this.log('User locate enabled. Requesting user location.');
      this.map.locate();
      this.map.on('locationfound', (ev: L.LocationEvent) => {
        this.log('Locationfound event: ', ev);
        const userLatLng = ev.latlng;
        if (userLatLng) {
          if (!this.userPosMarker) {
            this.userPosMarker = L.marker(
              // eslint-disable-next-line no-magic-numbers
              [47.4341, 8.46874], // TODO: For dev only
              // userLatLng,
              { icon: userPosIcon },
            ).addTo(this.map);
          } else {
            this.userPosMarker.setLatLng(userLatLng);
            this.map.fitBounds(ev.bounds);
          }
        }
      });
      this.map.on('locationerror', (errorEv: L.ErrorEvent) => {
        this.log('Failed to locate user.');
        this.log('Locationerror event: ', errorEv);
      });
    }
    this.setMarker();
  }

  private setMarker(): void {
    this.markers = [];
    this.ui.element.querySelectorAll<HTMLLIElement>(this.options.domSelectors.markerProps)
      .forEach((propertyNode) => {
        const latEl = propertyNode
          .querySelector<HTMLElement>(this.options.domSelectors.markerPropsLat);
        const lngEl = propertyNode
          .querySelector<HTMLElement>(this.options.domSelectors.markerPropsLng);

        if (latEl && lngEl) {
          const lat = Number.parseFloat(latEl.innerText);
          const lng = Number.parseFloat(lngEl.innerText);
          if (lat && lng) {
            this.markers.push(L.marker([lat, lng], {
              icon: markerIcon,
            }));
          }
        }
      });


    if (this.markers.length > 0) {
      const clusterGroup = L.markerClusterGroup({

        iconCreateFunction: cluster => L.divIcon({
          iconSize: [0, 0],
          html: `<div class="mdl-map_view__clustericon">${cluster.getChildCount()}</div>`,
        }),
      });
      // set map bounds
      const markerGroup = L.featureGroup(this.markers);
      this.map.fitBounds(markerGroup.getBounds(), { maxZoom: 14 });

      this.markers.forEach((m, idx) => {
        m.on('mouseover', (ev) => {
          this.log('Marker mouseover', ev);
          ev.target.setIcon(markerIconHighlight);
          this.ui.mapContainer.dispatchEvent(MapView.markerMouseOverEvent(idx));
        }).on('mouseout', (ev) => {
          this.log('Marker mouseout', ev);
          ev.target.setIcon(markerIcon);
          this.ui.mapContainer.dispatchEvent(MapView.markerMouseOverEvent());
        });
        clusterGroup.addLayer(m);
      });
      this.map.addLayer(clusterGroup);
    }
  }

  /**
   * Unbind events, remove data, custom teardown
   */
  destroy() {
    super.destroy();

    // Custom destroy actions go here
  }

  static extMarkerHighlightEvent(highlightIndex: number) {
    return new CustomEvent(MapView.events.highlightMarker, { detail: { idx: highlightIndex } });
  }
  static markerMouseOverEvent(highlightIndex?: number) {
    return new CustomEvent(
      MapView.events.markerMouseOver,
      { detail: { idx: highlightIndex === undefined ? -1 : highlightIndex } },
    );
  }
}

export default MapView;
