
interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void;
    client: {
      init: (config: {
        apiKey?: string | null;
        clientId: string;
        discoveryDocs?: string[];
        scope: string;
      }) => Promise<void>;
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
      };
    };
  };
}
