import type { LoginManager, NigtscoutCredentials } from '~/core/nightscout/login-manager';
import { BehaviorSubject } from 'rxjs';

declare global {
  interface PasswordCredentialInit {
    id: string;
    name?: string;
    password: string;
    origin?: string;
  }

  class PasswordCredential {
    public readonly id: string;
    public readonly type = 'password';
    public readonly name: string;
    public readonly password: string;
    constructor(init?: PasswordCredentialInit);
  }

  interface CredentialsContainer {
    create(opts: { password: PasswordCredential }): Promise<void>;
    get(
      options?: CredentialRequestOptions & { password: true }
    ): Promise<PasswordCredential | null>;
  }

  interface Window {
    PasswordCredential: typeof PasswordCredential | undefined;
  }
}

let loginManager: LoginManager;

if (window.PasswordCredential) {
  class WebLoginManager implements LoginManager {
    public loginStatus: BehaviorSubject<NigtscoutCredentials | null>;
    constructor() {
      this.loginStatus = new BehaviorSubject<NigtscoutCredentials | null>(null);
      this.getCredentials().then((credentials) => {
        this.loginStatus.next(credentials);
      });
    }

    async login(credentials: NigtscoutCredentials): Promise<void> {
      const credential = new PasswordCredential({
        id: credentials.url,
        password: credentials.token,
      });
      await navigator.credentials.store(credential);
      this.loginStatus.next(credentials);
    }

    async logout(): Promise<void> {
      await navigator.credentials.preventSilentAccess();
      this.loginStatus.next(null);
    }

    private async getCredentials(): Promise<NigtscoutCredentials | null> {
      const credentials = await navigator.credentials.get({
        password: true,
      });
      if (credentials === null) {
        return null;
      }
      return {
        url: credentials.id,
        token: credentials.password,
      };
    }
  }

  loginManager = new WebLoginManager();
} else {
  class LocalStorageLoginManager implements LoginManager {
    public loginStatus: BehaviorSubject<NigtscoutCredentials | null>;
    constructor() {
      this.loginStatus = new BehaviorSubject<NigtscoutCredentials | null>(null);
      this.getCredentials().then((credentials) => {
        this.loginStatus.next(credentials);
      });
    }

    async login(credentials: NigtscoutCredentials): Promise<void> {
      localStorage.setItem('nightscout-api', JSON.stringify(credentials));
      this.loginStatus.next(credentials);
    }

    async logout(): Promise<void> {
      localStorage.removeItem('nightscout-api');
      this.loginStatus.next(null);
    }

    private async getCredentials(): Promise<NigtscoutCredentials | null> {
      const credentials = localStorage.getItem('nightscout-api');
      if (credentials === null) {
        return null;
      }
      return JSON.parse(credentials);
    }
  }

  loginManager = new LocalStorageLoginManager();
}

console.log('loginManager', loginManager);

export default loginManager;
