declare global {
  class TokenPosition {
    line: number;
    column: number;
  }

  class Token {
    type: TokenType;
    name: string;
    content: string;
    location: TokenPosition;
  }
}

export enum TokenType {
  "WHITESPACE",
  "DELIMITER",
  "IDENTIFIER",
  "CONSTANT",
  "KEYWORD",
  "TYPE",
  "COMMENT",
}

/** WHITE - Whitespace */
export const WHITESPACE: Record<string, string> = {
  SPACE: " ",
  RETURN: "\r",
  NEWLINE: "\n",
  TAB: "\t",
  V_TAB: "\v",
  BACKSPACE: "\b",
  FORM_FEED: "\f",
  EOF: "\0",
};

/** PUNCT - Punctuation */
export enum PUNCTUATION {
  COMMA = ",",
  COLON = ":",
  SEMICOLON = ";",
  DOT = ".",
  SINGLE_QUOTE = "'",
  DOUBLE_QUOTE = '"',
  BACKSLASH = "\\",
  SLASH = "/",
  ASTERIX = "*",
  EXCLAMATION = "!",
  AMPERSAND = "&",
  POWER = "^",
  EQUALS = "=",
  PLUS = "+",
  MINUS = "-",
  O_PAR = "(",
  C_PAR = ")",
  O_CUR_BR = "{",
  C_CUR_BR = "}",
  O_ANG_BR = "<",
  C_ANG_BR = ">",
  O_SQR_BR = "[",
  C_SQR_BR = "]",
  INCREMENT = "++",
  DECREMENT = "--",
  ARROW = "=>",
}

/** RESER - Reserved */
export const KEYWORDS: Record<string, string> = {
  AWAIT: "await",
  BREAK: "break",
  CASE: "case",
  CATCH: "catch",
  CLASS: "class",
  CONSOLE: "console",
  CONST: "const",
  CONTINUE: "continue",
  DEFAULT: "default",
  DELETE: "delete",
  DO: "do",
  ELSE: "else",
  ENUM: "enum,",
  EXPORT: "export",
  EXTENDS: "extends",
  FALSE: "false",
  FINALLY: "finally",
  FOR: "for",
  FUNCTION: "functions",
  IF: "if",
  IMPORT: "import",
  IN: "in",
  INSTANCE_OF: "instanceof",
  NEW: "new",
  NULL: "null",
  PRIVATE: "private",
  RETURN: "return",
  SUPER: "super",
  SWITCH: "switch",
  THIS: "this",
  THROW: "throw",
  TRUE: "true",
  TRY: "try",
  TYPEOF: "typeof",
  VAR: "var",
  VOID: "void",
  WHILE: "while",
  WITH: "with",
  YIELD: "yield",

  LET: "let",
};

/** TYPED - Type Definitions */
export const TYPES: Record<string, string> = {
  NUMBER: "NUMBER",
  STRING: "STRING",
  BOOLEAN: "BOOLEAN",
};
