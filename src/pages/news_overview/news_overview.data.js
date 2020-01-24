const _ = require('lodash');
const defaultData = require('../../data/default.data.js');
const dataHelper = require('@unic/estatico-data');
const headerData = require('../../modules/header/header.data');
const defPageHeaderData = require('../../modules/page_header/page_header.data.js').variants.default.props;
const defNewsOverviewData = require('../../modules/news_overview/news_overview.data');
const defCTABoxData = require('../../modules/cta_box/cta_box.data');
const defBack2TopData = require('../../modules/back2top/back2top.data').variants.default.props;
const defRelatedContentData = require('../../modules/related_content/related_content.data');
const contentTeaserDataWithoutBuzzwords = require('../../atoms/content_teaser/content_teaser.data').variants.withoutBuzzwords.props;
const defBreadcrumbData = require('../../modules/breadcrumb/breadcrumb.data').variants.default.props;
const defFooterData = require('../../modules/footer/footer.data').variants.default.props;

const data = _.merge({}, defaultData, {
  meta: {
    title: 'News Übersicht',
    jira: 'CZHDEV-550',
    content: dataHelper.getFileContent('news_overview.hbs'),
    documentation: dataHelper.getDocumentation('news_overview.md'),
  },
  props: {
    header: headerData.variants.inverted.props,
    modules: {
      pageHeader: _.merge({}, defPageHeaderData, {
        homelink: '#',
        pageTitle: 'News Übersicht',
        noText: true,
        buttonData: false,
        breadcrumb: defBreadcrumbData,
      }),
      newsOverview: defNewsOverviewData.props,
      ctaBox: defCTABoxData.variants.default.props,
      relatedContent: _.assign(_.merge({}, defRelatedContentData.variants.default.props), {
        relatedContentHeading: {
          level: 2,
          title: 'Informationen für Medienschaffende',
        },
        contentNavData: {
          items: [
            _.merge({}, contentTeaserDataWithoutBuzzwords, {
              shortTitle: 'Informationen für Medien',
            }),
            _.merge({}, contentTeaserDataWithoutBuzzwords, {
              shortTitle: 'Medienkontakt',
            }),
          ],
        },
      }),
      back2topData: defBack2TopData,
      footerData: defFooterData,
    },
  },
});

module.exports = data;
