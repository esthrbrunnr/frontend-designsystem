const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const { handlebars } = require('@unic/estatico-handlebars');
const defaultData = require('../../data/default.data.js');

const template = dataHelper.getFileContent('skiplinks.hbs');
const data = _.merge({}, defaultData, {
  meta: {
    title: 'Sprunglinks',
    className: 'Skiplinks',
    jira: 'CZHDEV-292',
    documentation: dataHelper.getDocumentation('skiplinks.md'),
  },
  props: {
    title: 'Sprunglinks',
    links: [
      {
        href: '/',
        accesskey: 0,
        label: 'Startseite',
      }, {
        href: '#navigation',
        accesskey: 1,
        label: 'Navigation',
      }, {
        href: '#content',
        accesskey: 2,
        label: 'Inhalt',
      }, {
        href: '/kontakt.html',
        accesskey: 3,
        label: 'Kontakt',
      }, {
        href: '/suche.html',
        accesskey: 4,
        label: 'Suche',
      }, {
        href: '#contentinfo',
        accesskey: 5,
        label: 'Fussbereich',
      },
    ],
  },
});
const variants = _.mapValues({
  default: {
    meta: {
      title: 'Standard',
      desc: 'Keine visuelle Darstellung ausser, wenn ein Sprunglink Fokus erhält.',
    },
  },
}, (variant) => {
  const variantProps = _.merge({}, data, variant).props;
  const compiledVariant = () => handlebars.compile(template)(variantProps);
  const variantData = _.merge({}, data, variant, {
    meta: {
      demo: compiledVariant,

      code: {
        handlebars: dataHelper.getFormattedHandlebars(template),
        html: dataHelper.getFormattedHtml(compiledVariant()),
        data: dataHelper.getFormattedJson(variantProps),
      },
    },
  });

  return variantData;
});

data.variants = variants;

module.exports = data;
