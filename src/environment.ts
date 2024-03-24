import { LogLevel } from './app/models/LogLevel';
import { LogTarget } from './app/models/LogTarget';

export const environment = {
  podcastUrl: 'http://localhost:4061',
  episodeUrl: 'http://localhost:4062',
  fileMngUrl: 'http://localhost:4063',
  loggerUrl: 'http://localhost:4064',
  logLevel: LogLevel.DEBUG,
  logTarget: LogTarget.CONSOLE,
  //   feedMngUrl: 'http://localhost:4064',

  auth0: {
    domain: 'oxymoron-tech.eu.auth0.com',
    id: '9lbgWvJYmVXtSpUa2LOqybe9mZkfagl6',
  },
};
