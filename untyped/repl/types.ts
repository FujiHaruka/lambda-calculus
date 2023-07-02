export type CommandType = "empty" | "reduce" | "reduce_verbose" | "exit";

interface BaseCommand {
  type: CommandType;
}

export interface EmptyCommand extends BaseCommand {
  type: "empty";
}

export interface ReduceCommand extends BaseCommand {
  type: "reduce";
  expression: string;
}

export interface ReduceVerboseCommand extends BaseCommand {
  type: "reduce_verbose";
  expression: string;
}

export interface ExitCommand extends BaseCommand {
  type: "exit";
}

export type Command =
  | EmptyCommand
  | ReduceCommand
  | ReduceVerboseCommand
  | ExitCommand;
