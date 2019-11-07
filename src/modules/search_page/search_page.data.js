const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const { handlebars } = require('@unic/estatico-handlebars');
const defaultData = require('../../data/default.data.js');

const formInputData = require('../../atoms/form_input/form_input.data');
const paginationData = require('../pagination/pagination.data');

const template = dataHelper.getFileContent('search_page.hbs');
const data = _.merge({}, defaultData, {
  meta: {
    title: 'Suchseite (Modul)',
    className: 'SearchPage',
    jira: 'CZHDEV-807',
    documentation: dataHelper.getDocumentation('search_page.md'),
    label: 'Suche',
  },
  props: {
    input: formInputData.variants.search.props,
    options: JSON.stringify({
      url: '/mocks/modules/search_page/search_page.json',
    }),
    pagination: paginationData.props,
    templates: {
    },
  },
});
const variants = _.mapValues({
  default: {
    meta: {
      title: 'Default',
      desc: '',
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