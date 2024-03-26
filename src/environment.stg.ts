import { LogLevel } from "./app/models/LogLevel";
import { LogTarget } from "./app/models/LogTarget";

export const environment = {
  podcastUrl: 'https://---.execute-api.il-central-1.amazonaws.com/dev',
  episodeUrl: 'https://---.execute-api.il-central-1.amazonaws.com/dev',
  fileMngUrl: 'https://---.execute-api.il-central-1.amazonaws.com/dev',
  loggerUrl: 'https://---.execute-api.il-central-1.amazonaws.com/dev',
  
  logLevel: LogLevel.INFO,
  logTarget: LogTarget.SERVICE,

  auth0: {
    domain: 'oxymoron-tech.eu.auth0.com',
    id: '--stg--',
  },
};
