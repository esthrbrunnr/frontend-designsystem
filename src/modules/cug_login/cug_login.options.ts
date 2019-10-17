interface ModuleDomSelectors {
  configuredLoginEndpoint: string;
  configuredRedirectUrl: string;
  loginBtn: string;
  logoutBtn: string;
  usernameInput: string;
  passwordInput: string;
  showPasswordBtn: string;
}
interface ModuleStateClasses {
  unauthorised: string;
  credentialsFailed: string;
  connectionFail: string;
  loginBtnDisable: string;
}
export interface CugLoginModuleOptions {
  devModeAttr: string;
  mockAssets: {
    emptyResponse: string;
    unauthenticatedLogin: string;
    unauthorizedLogin: string;
    loginOk: string;
  },
  domSelectors: ModuleDomSelectors;
  stateClasses: ModuleStateClasses;
}

const domSelectors: ModuleDomSelectors = {
  configuredLoginEndpoint: '[data-cug_login=doLoginEndpoint]',
  configuredRedirectUrl: '[data-cug_login=successRedirectUrl]',
  loginBtn: '[data-cug_login=doLogin]',
  logoutBtn: '[data-cug_login=doLogout]',
  usernameInput: '[data-cug_login=cellUsername] input',
  passwordInput: '[data-cug_login=cellPassword] input',
  showPasswordBtn: '[data-cug_login=cellPassword] .atm-form_input__functionality',
};
const stateClasses: ModuleStateClasses = {
  unauthorised: 'mdl-cug_login--unauthorized',
  credentialsFailed: 'mdl-cug_login--credentials-failed',
  connectionFail: 'mdl-cug_login--connection-fail',
  loginBtnDisable: 'atm-button--disabled',
};
export const CugLoginDefaultOptions: CugLoginModuleOptions = { // eslint-disable-line
  devModeAttr: 'data-cug_login-devmode',
  mockAssets: {
    emptyResponse: '/assets/mocks/cug/login_empty.json',
    unauthenticatedLogin: '/assets/mocks/cug/login_unauthenticated.json',
    unauthorizedLogin: '/assets/mocks/cug/login_unauthorized.json',
    loginOk: '/assets/mocks/cug/login_ok.json',
  },
  domSelectors,
  stateClasses,
};
