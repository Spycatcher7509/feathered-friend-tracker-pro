
interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void;
    client: {
      init: (config: {
        clientId: string;
        scope: string;
        discoveryDocs?: string[];
      }) => Promise<void>;
      load: (api: string, version: string) => Promise<void>;
      drive: {
        files: {
          create: (params: {
            resource: any;
            media: {
              mimeType: string;
              body: Blob;
            };
          }) => Promise<any>;
        };
      };
    };
    auth2: {
      init: (params: {
        client_id: string;
        scope: string;
      }) => Promise<any>;
      getAuthInstance: () => GoogleAuthInstance | null;
    };
  };
}

interface GoogleAuthInstance {
  isSignedIn: {
    get: () => boolean;
  };
  signIn: () => Promise<void>;
  currentUser: {
    get: () => GoogleUser;
  };
}

interface GoogleUser {
  getBasicProfile: () => {
    getName: () => string;
    getEmail: () => string;
    getId: () => string;
  };
}
