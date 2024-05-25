import * as SecureStore from 'expo-secure-store';
import { Observable, ReplaySubject } from 'rxjs';

export type NigtscoutCredentials = {
  url: string;
  token: string;
};

export interface LoginManager {
  login(credentials: NigtscoutCredentials): Promise<void>;
  logout(): Promise<void>;
  loginStatus$: Observable<NigtscoutCredentials | null>;
}

class ExpoSecureLoginManager implements LoginManager {
  public loginStatus$: ReplaySubject<NigtscoutCredentials | null>;

  constructor() {
    this.loginStatus$ = new ReplaySubject<NigtscoutCredentials | null>(1);
    this.getCredentials().then(async (credentials) => {
      this.loginStatus$.next(credentials);
    });
  }

  async login(credentials: NigtscoutCredentials): Promise<void> {
    await SecureStore.setItemAsync('nightscout-api', JSON.stringify(credentials));
    this.loginStatus$.next(credentials);
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('nightscout-api');
    this.loginStatus$.next(null);
  }

  private async getCredentials(): Promise<NigtscoutCredentials | null> {
    const credentials = await SecureStore.getItemAsync('nightscout-api');
    if (credentials === null) {
      return null;
    }
    return JSON.parse(credentials);
  }
}

const loginManager: LoginManager = new ExpoSecureLoginManager();

export default loginManager;
