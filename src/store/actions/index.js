import { createAction as action } from 'typesafe-actions';

// Wallet
export const setWeb3 = action('auth/SET_WEB3')();
export const setIsStarted = action('auth/SET_ISCONNECTED')();
export const setInjectedProvider = action('auth/SET_INJECTEDPROVIDER')();
export const setCurAcount = action('auth/SET_CURACCOUNT')();
export const setInit = action('auth/SET_INIT')();
