import { LogLevel } from './LogLevel';

export class LogRec {
  Created?: string;
  UserID!: string;
  Msg!: string;
  Data!: string;
  LogType!: LogLevel;
}
