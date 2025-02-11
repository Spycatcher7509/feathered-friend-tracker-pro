
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
      getAuthInstance: () => {
        isSignedIn: {
          get: () => boolean;
        };
        signIn: () => Promise<void>;
      } | null;
    };
  };
}
