import { LogLevel } from './app/models/LogLevel';
import { LogTarget } from './app/models/LogTarget';

export const environment = {
  podcastUrl: 'https://4oy063kj1f.execute-api.il-central-1.amazonaws.com/dev',
  episodeUrl: 'https://46iwk2wgsc.execute-api.il-central-1.amazonaws.com/dev',
  fileMngUrl: 'https://o0sg124qr7.execute-api.il-central-1.amazonaws.com/dev',
  loggerUrl: 'http://localhost:4064',
  logLevel: LogLevel.INFO,
  LogTarget: LogTarget.SERVICE,

  auth0: {
    domain: 'oxymoron-tech.eu.auth0.com',
    id: 'b1ax44IcKgcCgOIdkgVfMGQT87oAReqn',
  },
};
