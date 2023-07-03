export type CommandType =
  | "empty"
  | "validate"
  | "reduce"
  | "exit";

interface BaseCommand {
  type: CommandType;
}

export interface EmptyCommand extends BaseCommand {
  type: "empty";
}

export interface ValidateCommand extends BaseCommand {
  type: "validate";
  expression: string;
}

export interface ReduceCommand extends BaseCommand {
  type: "reduce";
  expression: string;
}

export interface ExitCommand extends BaseCommand {
  type: "exit";
}

export type Command =
  | EmptyCommand
  | ValidateCommand
  | ReduceCommand
  | ExitCommand;
