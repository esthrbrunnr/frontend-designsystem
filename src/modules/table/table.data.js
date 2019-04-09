const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const { handlebars } = require('@unic/estatico-handlebars');
const defaultData = require('../../data/default.data.js');

const defFigcaptionData = require('../../atoms/figcaption/figcaption.data').variants.default;

const template = dataHelper.getFileContent('table.hbs');
const data = _.merge({}, defaultData, {
  meta: {
    title: 'Tabelle',
    className: 'Table',
    jira: 'CZHDEV-121',
    documentation: dataHelper.getDocumentation('table.md'),
  },
  props: {
    title: 'Der Kanton in Zahlen',
    subtitle: '2007–2017',
    headers: [
      {
        title: '<span class="visuallyhidden">Bezirk</span>',
        isSortable: false,
      }, {
        title: 'Einwohnerzahl<sup>1</sup> 2017',
        isSortable: false,
      }, {
        title: 'Bevölkerungswachstum<br> 2007–2017 in %',
        isSortable: false,
      }, {
        title: 'Beschäftigte 2015',
        isSortable: false,
      }
    ],
    bodyrows: [
      {
        data: ['Kanton Zürich', '1498643', '15,2', '1005751'],
        isHighlighted: true,
      }, {
        data: ['Affoltern', '53531', '18,4', '17171'],
      }, {
        data: ['Andelfingen', '31140', '9,6', '11094'],
      }, {
        data: ['Bülach', '148897', '21,3', '110370'],
      }, {
        data: ['Dielsdorf', '89221', '19,1', '38164'],
      },
    ],
    caption: _.merge({}, defFigcaptionData, {
      caption: '<sup>1</sup> Nach zivilrechtlichem Wohnsitzbegriff, Daten per Ende Jahr<br><sup>2</sup> Stand 2016',
    }),
    hasTitle: true,
    headingLevel: 2,
    hasSubtitle: true,
    hasColumnHeader: true,
    hasRowHeader: false,
    hasCaption: true,
    alignRight: false,
    colorVariation: false,
  },
});
const variants = _.mapValues({
  default: {
    meta: {
      title: 'Standard',
      desc: 'Standard-Tabelle',
    },
  },
  alignRight: {
    meta: {
      title: 'Rechtsbündig',
      desc: 'Variante mit rechtsbündig ausgerichteten Datenzellen',
    },
    props: {
      alignRight: true,
    },
  },
  noTitle: {
    meta: {
      title: 'Ohne Titel',
      desc: 'Variante ohne Titel',
    },
    props: {
      hasTitle: false,
    },
  },
  withLinks: {
    meta: {
      title: 'Mit Links',
      desc: 'Variante mit Links, Titel als H3',
    },
    props: {
      title: 'H3: 28px Black title Kontrollpunkt für mobile Geräte eingerichtet – den ersten in der Schweiz.',
      headingLevel: 3,
      hasSubtitle: false,
      hasCaption: false,
      headers: [
        {
          title: 'Daten/Publikation',
          isSortable: false,
        }, {
          title: 'Termin',
          isSortable: false,
        },
      ],
      bodyrows: [
        {
          data: ['<a href="#">Gemeindesteuerfüsse 2019</a>', 'Januar bis März'],
        },
        {
          data: ['<a href="#">Kantonale Bevölkerungsstatistik 2018 (prov.)</a>', '08. Februar'],
        },
        {
          data: ['<a href="#">Abstimmungsanalyse Februar</a>', 'Ende Februar'],
        },
        {
          data: ['<a href="#">Ausländerstatistik 2018</a>', 'März'],
        },
      ],
    },
  },
  withRowHeader: {
    meta: {
      title: 'Mit Reihenüberschriften',
      desc: 'Variante mit Reihenüberschriften, Titel als H4',
    },
    props: {
      title: 'Demografische Altersmasszahlen nach Gebiet 2016',
      headingLevel: 4,
      hasSubtitle: false,
      hasRowHeader: true,
      alignRight: true,
      headers: [
        {
          title: '<span class="visuallyhidden">Alterssegment</span>',
          isSortable: false,
        }, {
          title: 'Kanton Zürich',
          isSortable: false,
        }, {
          title: 'Stadt Zürich',
          isSortable: false,
        }, {
          title: 'Übriger Kanton ZH',
          isSortable: false,
        }, {
          title: 'Schweiz',
          isSortable: false,
        }, {
          title: 'Schweiz ohne<br>Kanton ZH',
          isSortable: false,
        },
      ],
      bodyrows: [
        {
          data: ['0–19 Jahre', '293', '68', '225', '1691', '1398'],
        }, {
          data: ['20–39 Jahre', '293', '68', '225', '1691', '1398'],
        }, {
          data: ['40–64 Jahre', '293', '68', '225', '1691', '1398'],
        }, {
          data: ['65–79 Jahre', '293', '68', '225', '1691', '1398'],
        },
      ],
    },
  },
  blue: {
    meta: {
      title: 'Blau ZH',
      desc: '',
    },
    props: {
      colorVariation: 'blue',
    },
  },
  darkblue: {
    meta: {
      title: 'Dunkelblau ZH',
      desc: '',
    },
    props: {
      colorVariation: 'darkblue',
    },
  },
  turqoise: {
    meta: {
      title: 'Türkis ZH',
      desc: '',
    },
    props: {
      colorVariation: 'turqoise',
    },
  },
  green: {
    meta: {
      title: 'Grün ZH',
      desc: '',
    },
    props: {
      colorVariation: 'green',
    },
  },
  bordeaux: {
    meta: {
      title: 'Bordeaux ZH',
      desc: '',
    },
    props: {
      colorVariation: 'bordeaux',
    },
  },
  magenta: {
    meta: {
      title: 'Magenta ZH',
      desc: '',
    },
    props: {
      colorVariation: 'magenta',
    },
  },
  violet: {
    meta: {
      title: 'Violett ZH',
      desc: '',
    },
    props: {
      colorVariation: 'violet',
    },
  },
}, (variant) => {
  // eslint-disable-next-line consistent-return
  const variantProps = _.mergeWith({}, data, variant, (dataValue, variantValue, key) => {
    if ((key === 'bodyrows') || (key === 'headers')) {
      return variantValue;
    }
  }).props;

  const compiledVariant = () => handlebars.compile(template)(variantProps);
  const variantData = _.mergeWith({}, data, variant, {
    meta: {
      demo: compiledVariant,

      code: {
        handlebars: dataHelper.getFormattedHandlebars(template),
        html: dataHelper.getFormattedHtml(compiledVariant()),
        data: dataHelper.getFormattedJson(variantProps),
      },
    },
  // eslint-disable-next-line consistent-return
  }, (dataValue, variantValue, key) => {
    if ((key === 'bodyrows') || (key === 'headers')) {
      return variantValue;
    }
  });

  return variantData;
});

data.variants = variants;

module.exports = data;
