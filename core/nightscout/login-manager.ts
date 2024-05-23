import * as SecureStore from 'expo-secure-store';
import { BehaviorSubject, Observable } from 'rxjs';

export type NigtscoutCredentials = {
  url: string;
  token: string;
};

export interface LoginManager {
  login(credentials: NigtscoutCredentials): Promise<void>;
  logout(): Promise<void>;
  loginStatus: Observable<NigtscoutCredentials | null>;
}

class ExpoSecureLoginManager implements LoginManager {
  public loginStatus: BehaviorSubject<NigtscoutCredentials | null>;

  constructor() {
    this.loginStatus = new BehaviorSubject<NigtscoutCredentials | null>(null);
    this.getCredentials().then((credentials) => {
      this.loginStatus.next(credentials);
    });
  }

  async login(credentials: NigtscoutCredentials): Promise<void> {
    await SecureStore.setItemAsync('nightscout-api', JSON.stringify(credentials));
    this.loginStatus.next(credentials);
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('nightscout-api');
    this.loginStatus.next(null);
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
