import { TokenType, WHITESPACE, PUNCTUATION, KEYWORDS, TYPES } from "./types";

import fs = require("fs");

let content: string[];
let currentCharacterIndex: number = 0;

// Functia mare care citeste si analizeaza lexical fisierul de intrare
export function readFile(filePath: string): Token[] {
  content = fs.readFileSync(filePath, "utf8").split("");

  let tempToken: Token = undefined;
  let tokens: Token[] = new Array();

  while (currentCharacterIndex < content.length) {
    /* Parse character */
    tempToken = read();
    tokens.push(tempToken);
  }

  const stringifiedTokens = tokens.map(
    (token) =>
      `'${token.content}',                         ${token.name};      ${token.content.length};       linia ${token.location.column}  coloana: ${token.location.line}`
  );

  fs.writeFile("./output.txt", stringifiedTokens.join("\n"), function (err) {
    if (err) {
      throw err;
    }
    console.log(" Saved successfully!");
  });

  return tokens;
}

// Parcurge fiecare caracter si returneaza tokenul asociat
function read(): Token {
  // Single-line comments
  if (
    getCurrentCharacter() == PUNCTUATION.SLASH &&
    peekNextCharacter() == PUNCTUATION.SLASH
  ) {
    const commContent = skipUntil(WHITESPACE["NEWLINE"]);
    return createToken(TokenType.COMMENT, "COMMENT", commContent);
    // return readNext();
  }

  // Multiline comments
  if (
    getCurrentCharacter() == PUNCTUATION.SLASH &&
    peekNextCharacter() == PUNCTUATION.ASTERIX
  ) {
    let commContent = "";
    while (peekNextCharacter() != PUNCTUATION.SLASH) {
      nextCharacter();
      commContent += skipUntil(PUNCTUATION.ASTERIX);
    }
    nextCharacter();
    return createToken(TokenType.COMMENT, "COMMENT", commContent);
  }

  // Ignore white spaces
  if (isMapped(WHITESPACE, getCurrentCharacter())) {
    return readNext();
  }

  // Parsare constante de tip string, atat cu apostrof cat si cu ghilimele
  if (getCurrentCharacter() == PUNCTUATION.SINGLE_QUOTE) {
    nextCharacter();
    let string: string = skipUntil(PUNCTUATION.SINGLE_QUOTE);
    nextCharacter();

    return createToken(TokenType.CONSTANT, TYPES.string, string);
  } else if (getCurrentCharacter() == PUNCTUATION.DOUBLE_QUOTE) {
    nextCharacter();
    let string: string = skipUntil(PUNCTUATION.DOUBLE_QUOTE);
    nextCharacter();

    return createToken(TokenType.CONSTANT, TYPES["STRING"], string);
  }

  let token: Token;

  // Parsare operatori de incrementare si decrementare
  if (
    getCurrentCharacter() == PUNCTUATION.PLUS &&
    peekNextCharacter() == PUNCTUATION.PLUS
  ) {
    nextCharacter();
    nextCharacter();
    return createToken(TokenType.DELIMITER, "INCREMENT", PUNCTUATION.INCREMENT);
  }
  if (
    getCurrentCharacter() == PUNCTUATION.MINUS &&
    peekNextCharacter() == PUNCTUATION.MINUS
  ) {
    nextCharacter();
    nextCharacter();
    return createToken(TokenType.DELIMITER, "DECREMENT", PUNCTUATION.DECREMENT);
  }

  // Parsare separatori de lungime 1
  let tempKey = getKey(PUNCTUATION, getCurrentCharacter());
  if (tempKey != null) {
    token = createToken(TokenType.DELIMITER, tempKey, PUNCTUATION[tempKey]);
    nextCharacter();
  } else {
    /* Parse words */
    token = readNextWord();
  }

  return token;
}

// incrementare index caracter curent, iar apoi este apelata functia de mai sus, pentru a se returna tokenul, daca este cazul
function readNext(): Token {
  nextCharacter();
  return read();
}

// citire si returnare cuvant urmator
function readNextWord(): Token {
  let word: string = "";
  let token: Token;

  let tempIndex: number = getCurrentCharacterIndex();
  let tempCharacter: string = getCharacter(tempIndex);

  // se cauta sfarsitul cuvantului
  while (
    !isMapped(WHITESPACE, tempCharacter) &&
    !isMapped(PUNCTUATION, tempCharacter)
  ) {
    word += tempCharacter;

    // handle-uire exceptie cand poate iesi din fisier
    if (tempIndex >= content.length) {
      break;
    }

    tempCharacter = getCharacter(++tempIndex);
  }

  setCurrentCharacterIndex(--tempIndex);

  let reservedKey: string = getKey(KEYWORDS, word);
  let typeKey: string = getKey(TYPES, word);

  // Verificarea keyword-urilor
  if (reservedKey != null) {
    token = createToken(TokenType.KEYWORD, reservedKey, word);
    // Verificarea daca e type
  } else if (typeKey != null) {
    token = createToken(TokenType.TYPE, typeKey, word);
  } else if (!isNaN(Number(word))) {
    // Verificare este o constanta de tip number
    token = createToken(TokenType.CONSTANT, TYPES["NUMBER"], word);
  } else {
    // Daca se ajunge aici, inseamna ca este un identificator
    token = createToken(TokenType.IDENTIFIER, "IDENTIFIER", word);
  }

  nextCharacter();

  return token;
}

// Functia de creare a unui nou token
function createToken(type: TokenType, name: string, content: string): Token {
  let location: number = getCurrentCharacterIndex();

  let position: TokenPosition = getSourcePos(location);
  // un token cuprinde tip, nume, continut, locatie
  return {
    type,
    name,
    content,
    location: position,
  };
}

// Functie de calculare a liniei si coloanei pe care se afla caracterul
function getSourcePos(position: number): TokenPosition {
  let lines: number = 1;
  let chars: number = 1;
  let iterator: number = 0;

  while (iterator < position) {
    if (getCharacter(iterator) == WHITESPACE.NEWLINE) {
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
function getCurrentCharacterIndex(): number {
  return currentCharacterIndex;
}

// Setter pentru indexul caracterului curent
function setCurrentCharacterIndex(index: number): void {
  currentCharacterIndex = index;
}

// Functie pentru incrementarea indexului caracterului curent
function nextCharacter(): void {
  return setCurrentCharacterIndex(getCurrentCharacterIndex() + 1);
}

// Functie care returneaza continutul de la pozitia curenta pana la prima aparitie a parametrului `target`
function skipUntil(target: string): string {
  let text: string = "";
  while (getCurrentCharacter() != target) {
    text += getCurrentCharacter();
    nextCharacter();
  }
  return text;
}

// Functie utilitara pentru a extrage caracterul curent
function getCharacter(characterIndex: number): string {
  return content[characterIndex];
}

// Functie pentru extragerea caracterului curent
function getCurrentCharacter(): string {
  return getCharacter(currentCharacterIndex);
}

// Functie pentru extragerea caracterului urmator, fara a schimba caracterul curent
function peekNextCharacter(): string {
  return getCharacter(currentCharacterIndex + 1);
}
