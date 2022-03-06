import { TokenType, WHITESPACE, PUNCTUATION, KEYWORDS, TYPES } from "./types";

import fs = require("fs");

let content: string[];
let currentCharIndex: number = 0;

// Functia mare care citeste si analizeaza lexical fisierul de intrare
export function readFile(path: string): Token[] {
  content = fs.readFileSync(path, "utf8").split("");

  let tempToken: Token = undefined;
  let tokens: Token[] = new Array();

  while (currentCharIndex < content.length) {
    /* Citirea fiecarui caracter */
    tempToken = read();
    tokens.push(tempToken);
  }

  const stringifiedTokens = tokens.map(
    (token) =>
      `'${token.content}', ${token.name}; ${token.content.length}; linia ${token.location.column} coloana: ${token.location.line}`
  );

  fs.writeFile("./output.txt", stringifiedTokens.join("\n"), function (err) {
    if (err) {
      throw err;
    }
    console.log(" Salvat cu succes!");
  });

  return tokens;
}

// Parcurge fiecare caracter si returneaza tokenul asociat
function read(): Token {
  // Single-line comments
  if (
    getCurrentChar() == PUNCTUATION.SLASH &&
    peekNextChar() == PUNCTUATION.SLASH
  ) {
    const commContent = skipUntil(WHITESPACE["NEWLINE"]);
    return createToken(TokenType.COMMENT, "COMMENT", commContent);
    // return readNext();
  }

  // Multiline comments
  if (
    getCurrentChar() == PUNCTUATION.SLASH &&
    peekNextChar() == PUNCTUATION.ASTERIX
  ) {
    let commContent = "";
    while (peekNextChar() != PUNCTUATION.SLASH) {
      nextChar();
      commContent += skipUntil(PUNCTUATION.ASTERIX);
    }
    nextChar();
    return createToken(TokenType.COMMENT, "COMMENT", commContent);
  }

  // Ignore white spaces
  if (isMapped(WHITESPACE, getCurrentChar())) {
    return readNext();
  }

  // Parsare constante de tip string, atat cu apostrof cat si cu ghilimele
  if (getCurrentChar() == PUNCTUATION.SINGLE_QUOTE) {
    nextChar();
    let string: string = skipUntil(PUNCTUATION.SINGLE_QUOTE);
    nextChar();

    return createToken(TokenType.CONSTANT, TYPES.string, string);
  } else if (getCurrentChar() == PUNCTUATION.DOUBLE_QUOTE) {
    nextChar();
    let string: string = skipUntil(PUNCTUATION.DOUBLE_QUOTE);
    nextChar();

    return createToken(TokenType.CONSTANT, "CONST STRING", string);
  }

  let token: Token;

  // Parsare operatori de incrementare si decrementare
  if (
    getCurrentChar() == PUNCTUATION.PLUS &&
    peekNextChar() == PUNCTUATION.PLUS
  ) {
    nextChar();
    nextChar();
    return createToken(TokenType.DELIMITER, "INCREMENT", PUNCTUATION.INCREMENT);
  }
  if (
    getCurrentChar() == PUNCTUATION.MINUS &&
    peekNextChar() == PUNCTUATION.MINUS
  ) {
    nextChar();
    nextChar();
    return createToken(TokenType.DELIMITER, "DECREMENT", PUNCTUATION.DECREMENT);
  }

  // Parsare separatori de lungime 1
  let tempKey = getKey(PUNCTUATION, getCurrentChar());
  if (tempKey != null) {
    token = createToken(TokenType.DELIMITER, "DELIMITER", PUNCTUATION[tempKey]);
    nextChar();
  } else {
    /* Parse words */
    token = readNextWord();
  }

  return token;
}

// incrementare index caracter curent, iar apoi este apelata functia de mai sus, pentru a se returna tokenul, daca este cazul
function readNext(): Token {
  nextChar();
  return read();
}

// citire si returnare cuvant urmator
function readNextWord(): Token {
  let word: string = "";
  let token: Token;

  let tempIndex: number = getCurrentCharIndex();
  let tempChar: string = getChar(tempIndex);

  // se cauta sfarsitul cuvantului
  while (!isMapped(WHITESPACE, tempChar) && !isMapped(PUNCTUATION, tempChar)) {
    word += tempChar;

    // handle-uire exceptie cand poate iesi din fisier
    if (tempIndex >= content.length) {
      break;
    }

    tempChar = getChar(++tempIndex);
  }

  setCurrentCharIndex(--tempIndex);

  let reservedKey: string = getKey(KEYWORDS, word);
  let typeKey: string = getKey(TYPES, word);

  // Verificarea keyword-urilor
  if (reservedKey != null) {
    token = createToken(TokenType.KEYWORD, "KEYWORD", word);
    // Verificarea daca e type
  } else if (typeKey != null) {
    token = createToken(TokenType.TYPE, "TYPE", word);
  } else if (!isNaN(Number(word))) {
    // Verificare este o constanta de tip number
    token = createToken(TokenType.CONSTANT, "CONST NUMBER", word);
  } else {
    // Daca se ajunge aici, inseamna ca este un identificator
    token = createToken(TokenType.IDENTIFIER, "IDENTIFIER", word);
  }

  nextChar();

  return token;
}

// Functia de creare a unui nou token
function createToken(type: TokenType, name: string, content: string): Token {
  let position: TokenPosition = getPositionBasedOnIndex(getCurrentCharIndex());
  // un token cuprinde tip, nume, continut, locatie
  return {
    type,
    name,
    content,
    location: position,
  };
}

// Functie de calculare a liniei si coloanei in functie de index
function getPositionBasedOnIndex(index: number): TokenPosition {
  let lines: number = 1;
  let chars: number = 1;
  let iterator: number = 0;

  while (iterator < index) {
    if (getChar(iterator) == WHITESPACE.NEWLINE) {
      chars = 1;
      lines++;
    }
    chars++;
    iterator++;
  }

  return { line: chars, column: lines };
}

// Functie utilitara pentru a verificarea unui termen intr-un Record
function isMapped(map: Record<string, string>, term: string): boolean {
  return getKey(map, term) != null;
}

// Getter pentru o cheie dintr-un Record
function getKey(map: Record<string, string>, term: string): string {
  for (let key in map) {
    if (map[key] == term) {
      return key;
    }
  }
  return null;
}

// Getter pentru indexul caracterului curent
function getCurrentCharIndex(): number {
  return currentCharIndex;
}

// Setter pentru indexul caracterului curent
function setCurrentCharIndex(index: number): void {
  currentCharIndex = index;
}

// Functie pentru incrementarea indexului caracterului curent
function nextChar(): void {
  return setCurrentCharIndex(getCurrentCharIndex() + 1);
}

// Functie care returneaza continutul de la pozitia curenta pana la prima aparitie a parametrului `target`
function skipUntil(target: string): string {
  let text: string = "";
  while (getCurrentChar() != target) {
    if (peekNextChar() == WHITESPACE["EOF"]) {
      return text;
    }
    text += getCurrentChar();
    nextChar();
  }
  return text;
}

// Functie utilitara pentru a extrage caracterul curent
function getChar(charIndex: number): string {
  return content[charIndex];
}

// Functie pentru extragerea caracterului curent
function getCurrentChar(): string {
  return getChar(currentCharIndex);
}

// Functie pentru extragerea caracterului urmator, fara a schimba caracterul curent
function peekNextChar(): string {
  return getChar(currentCharIndex + 1);
}
