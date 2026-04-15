/** Minimal typing for the Meta Facebook JS SDK (Embedded Signup). */

export type FacebookLoginStatus = "connected" | "not_authorized" | "unknown";

export type FacebookAuthResponse = {
  accessToken?: string;
  userID?: string;
  expiresIn?: number;
  signedRequest?: string;
  graphDomain?: string;
  data_access_expiration_time?: number;
};

export type FacebookLoginResponse = {
  status: FacebookLoginStatus;
  authResponse?: FacebookAuthResponse;
};

export type FacebookLoginOptions = Record<string, unknown>;

export type FacebookSDK = {
  init: (params: Record<string, unknown>) => void;
  login: (
    cb: (r: FacebookLoginResponse) => void,
    opts?: FacebookLoginOptions,
  ) => void;
  getLoginStatus: (cb: (r: FacebookLoginResponse) => void) => void;
};

declare global {
  interface Window {
    FB?: FacebookSDK;
    fbAsyncInit?: () => void;
  }
}

export {};
