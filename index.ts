import * as analyzer from "./analyzer";

let tokens = analyzer.readFile("./analyze_this_file.ts");

console.log(" \n\n Tokens: ", tokens);
