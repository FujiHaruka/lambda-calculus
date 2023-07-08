export type CommandType =
  | "empty"
  | "validate"
  | "eq"
  | "reduce"
  | "assign"
  | "comment"
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

export interface AlphaEquivalentCommand extends BaseCommand {
  type: "eq";
  expressionA: string;
  expressionB: string;
}

export interface AssignCommand extends BaseCommand {
  type: "assign";
  aliasIdentifier: string;
  commandExpression: string;
}

export interface CommentCommand extends BaseCommand {
  type: "comment";
}

export interface ExitCommand extends BaseCommand {
  type: "exit";
}

export type Command =
  | EmptyCommand
  | ValidateCommand
  | ReduceCommand
  | AlphaEquivalentCommand
  | AssignCommand
  | CommentCommand
  | ExitCommand;
