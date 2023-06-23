const COMMENT = 1;
const IDENT = 2;
const FUNCTION = 3;
const AT_KEYWORD = 4;
const HASH = 5;
const STRING = 6;
const BAD_STRING = 7;
const URL = 8;
const BAD_URL = 9;
const DELIM = 10;
const NUMBER = 11;
const PERCENTAGE = 12;
const DIMENSION = 13;
const WHITESPACE = 14;
const CDO = 15;
const CDC = 16;
const COLON = 17;
const SEMICOLON = 18;
const COMMA = 19;
const LEFT_SQUARE = 20;
const RIGHT_SQUARE = 21;
const LEFT_PAREN = 22;
const RIGHT_PAREN = 23;
const LEFT_CURLY = 24;
const RIGHT_CURLY = 25;
export const types = {
    COMMENT,
    IDENT,
    FUNCTION,
    AT_KEYWORD,
    HASH,
    STRING,
    BAD_STRING,
    URL,
    BAD_URL,
    DELIM,
    NUMBER,
    PERCENTAGE,
    DIMENSION,
    WHITESPACE,
    CDO,
    CDC,
    COLON,
    SEMICOLON,
    COMMA,
    LEFT_SQUARE,
    RIGHT_SQUARE,
    LEFT_PAREN,
    RIGHT_PAREN,
    LEFT_CURLY,
    RIGHT_CURLY,
};
const hexDigit = (cur) => (cur ^ 0x30) <= 9 ||
    ((cur | 0x20) >= 0x0061 && (cur | 0x20) <= 0x0066);
const identStart = (cur) => cur === 0x005f ||
    cur >= 0x0080 ||
    ((cur | 0x20) >= 0x0061 && (cur | 0x20) <= 0x007a);
const ident = (cur) => cur === 0x002d || (cur ^ 0x30) <= 9 || identStart(cur);
const newline = (cur) => cur === 0x000a || cur === 0x000c || cur === 0x000d;
const whitespace = (cur) => newline(cur) || cur === 0x0020 || cur === 0x0009;
const quote = (cur) => cur === 0x0022 || cur === 0x0027;
const nonPrintable = (cur) => (cur >= 0x0000 && cur <= 0x0008) ||
    cur === 0x000b ||
    (cur >= 0x000e && cur <= 0x001f) ||
    cur == 0x007f;
const specialDelims = {
    0x0028: LEFT_PAREN,
    0x0029: RIGHT_PAREN,
    0x002c: COMMA,
    0x003a: COLON,
    0x003b: SEMICOLON,
    0x005b: LEFT_SQUARE,
    0x005d: RIGHT_SQUARE,
    0x007b: LEFT_CURLY,
    0x007d: RIGHT_CURLY,
};
const NONPRINTABLE_RANGE = 1;
const WHITESPACE_RANGE = 2;
const QUOTE_RANGE = 3;
const DIGIT_RANGE = 4;
const SPECIAL_DELIM_RANGE = 5;
const SIGN_RANGE = 6;
const IDENTSTART_RANGE = 7;
const ranges = [];
for (let i = 0; i < 128; i += 1) {
    ranges[i] =
        (nonPrintable(i) && NONPRINTABLE_RANGE) ||
            (whitespace(i) && WHITESPACE_RANGE) ||
            (quote(i) && QUOTE_RANGE) ||
            ((i ^ 0x30) <= 9 && DIGIT_RANGE) ||
            (specialDelims[i] && SPECIAL_DELIM_RANGE) ||
            ((i === 0x002b || i === 0x002d) && SIGN_RANGE) ||
            (identStart(i) && IDENTSTART_RANGE) ||
            i;
}
const charCodeRange = (str, pos) => {
    return ranges[str.charCodeAt(pos)] || IDENTSTART_RANGE;
};
const escapeStartSequence = (str, pos) => str.charCodeAt(pos) === 0x005c && !newline(str.charCodeAt(pos + 1));
const numberStartSequence = (str, pos) => {
    const firstRange = charCodeRange(str, pos);
    const secondRange = charCodeRange(str, pos + 1);
    return (firstRange === DIGIT_RANGE ||
        (firstRange === SIGN_RANGE && secondRange === DIGIT_RANGE) ||
        (firstRange === SIGN_RANGE &&
            secondRange === 0x002e &&
            charCodeRange(str, pos + 2) === DIGIT_RANGE) ||
        (firstRange === 0x002e && secondRange === DIGIT_RANGE));
};
const identStartSequence = (str, pos) => {
    if (str.charCodeAt(pos) === 0x002d)
        pos += 1;
    if (str.charCodeAt(pos) === 0x002d)
        return true;
    return ((str.length > pos && charCodeRange(str, pos) === IDENTSTART_RANGE) ||
        escapeStartSequence(str, pos));
};
const consumeRangeSequence = (str, pos, range) => {
    while (charCodeRange(str, pos) === range)
        pos += 1;
    return pos;
};
const consumeEscapeSequence = (str, pos) => {
    pos += 2;
    if (pos > str.length)
        return str.length;
    if (hexDigit(str.charCodeAt(pos - 1))) {
        for (let i = 0; hexDigit(str.charCodeAt(pos)) && i < 5; i += 1, pos += 1) { }
        if (charCodeRange(str, pos) === WHITESPACE_RANGE)
            pos += 1;
    }
    return pos;
};
const REPLACEMENT = "\ufffd";
const decodeEscapeSequence = (str) => {
    if (!hexDigit(str.charCodeAt(0))) {
        return str[0] || REPLACEMENT;
    }
    const codePoint = parseInt(str, 16) || 0;
    if (codePoint > 0x10ffff ||
        codePoint <= 0 ||
        (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
        return REPLACEMENT;
    }
    return String.fromCodePoint(codePoint);
};
const consumeIdentSequence = (str, pos) => {
    const len = str.length;
    while (pos < len) {
        if (ident(str.charCodeAt(pos))) {
            pos += 1;
        }
        else if (escapeStartSequence(str, pos)) {
            pos = consumeEscapeSequence(str, pos);
        }
        else {
            break;
        }
    }
    return pos;
};
const decodeIdentSequence = (str) => {
    let identValue = "";
    for (let pos = 0; pos < str.length;) {
        if (ident(str.charCodeAt(pos))) {
            identValue += str[pos];
            pos += 1;
        }
        else if (escapeStartSequence(str, pos)) {
            identValue += decodeEscapeSequence(str.slice(pos + 1, (pos = consumeEscapeSequence(str, pos))));
        }
        else {
            break;
        }
    }
    return identValue;
};
const consumeNumberSequence = (str, pos) => {
    let char = charCodeRange(str, pos);
    if (char === SIGN_RANGE || char === 0x002e)
        pos += 1;
    pos = consumeRangeSequence(str, pos, DIGIT_RANGE);
    if (charCodeRange(str, pos) === 0x002e &&
        charCodeRange(str, pos + 1) === DIGIT_RANGE) {
        pos = consumeRangeSequence(str, pos + 2, DIGIT_RANGE);
    }
    char = charCodeRange(str, pos + 1);
    if ((str.charCodeAt(pos) | 32) === 0x0065 &&
        (char === SIGN_RANGE || char === DIGIT_RANGE)) {
        pos = consumeRangeSequence(str, pos + 2, DIGIT_RANGE);
    }
    return pos;
};
const consumeURLSequence = (str, pos) => {
    let token = URL;
    const len = str.length;
    pos = consumeRangeSequence(str, pos, WHITESPACE_RANGE);
    while (pos < len) {
        let char = str.charCodeAt(pos);
        let charRange = charCodeRange(str, pos);
        if (char === 0x029) {
            pos += 1;
            break;
        }
        else if (token === URL &&
            (charRange === QUOTE_RANGE ||
                char === 0x028 ||
                charRange === NONPRINTABLE_RANGE)) {
            token = BAD_URL;
        }
        else if (char === 0x05c) {
            if (escapeStartSequence(str, pos)) {
                pos = consumeEscapeSequence(str, pos);
            }
            else {
                pos += 1;
                token = BAD_URL;
            }
        }
        else if (charRange === WHITESPACE_RANGE) {
            pos = consumeRangeSequence(str, pos, WHITESPACE_RANGE);
            char = str.charCodeAt(pos);
            if (!char) {
                break;
            }
            else if (char === 0x029) {
                pos += 1;
                break;
            }
            else {
                token = BAD_URL;
            }
        }
        else {
            pos += 1;
        }
    }
    return [token, pos];
};
const consumeIdentLikeToken = (str, pos) => {
    const lastPos = pos;
    pos = consumeIdentSequence(str, pos);
    if (str.charCodeAt(pos) === 0x0028) {
        const whitePos = consumeRangeSequence(str, pos + 1, WHITESPACE_RANGE);
        pos += 1;
        if (whitePos - pos <= 4 &&
            decodeIdentSequence(str.slice(lastPos, pos - 1)).toLowerCase() == "url" &&
            charCodeRange(str, whitePos) !== QUOTE_RANGE) {
            return consumeURLSequence(str, pos);
        }
        return [FUNCTION, pos];
    }
    return [IDENT, pos];
};
const consumeNumericToken = (str, pos) => {
    pos = consumeNumberSequence(str, pos);
    let token = NUMBER;
    if (str.charCodeAt(pos) === 0x025) {
        pos += 1;
        token = PERCENTAGE;
    }
    else if (identStartSequence(str, pos)) {
        pos = consumeIdentSequence(str, pos);
        token = DIMENSION;
    }
    return [token, pos];
};
const consumeStringToken = (str, pos) => {
    const quote = str.charCodeAt(pos);
    pos += 1;
    const len = str.length;
    while (pos < len) {
        switch (str.charCodeAt(pos)) {
            case quote:
                pos += 1;
                return [STRING, pos];
            case 0x000a:
            case 0x000c:
            case 0x000d:
                return [BAD_STRING, pos];
            case 0x005c:
                if (pos == len - 1) {
                    pos += 1;
                }
                else if (newline(str.charCodeAt(pos + 1))) {
                    pos += 2;
                }
                else if (escapeStartSequence(str, pos)) {
                    pos = consumeEscapeSequence(str, pos);
                }
                break;
            default:
                pos += 1;
        }
    }
    return [STRING, pos];
};
export function* lex(str) {
    const len = str.length;
    let token;
    let start = 0;
    let pos = 0;
    while (pos < len) {
        switch (charCodeRange(str, pos)) {
            case WHITESPACE_RANGE:
                pos = consumeRangeSequence(str, pos, WHITESPACE_RANGE);
                token = WHITESPACE;
                break;
            case QUOTE_RANGE:
                [token, pos] = consumeStringToken(str, pos);
                break;
            case DIGIT_RANGE:
                [token, pos] = consumeNumericToken(str, pos);
                break;
            case SIGN_RANGE:
                if (numberStartSequence(str, pos)) {
                    [token, pos] = consumeNumericToken(str, pos);
                }
                else if (str.charCodeAt(pos) === 0x002d &&
                    str.charCodeAt(pos + 1) === 0x002d &&
                    str.charCodeAt(pos + 2) === 0x003e) {
                    token = CDC;
                    pos += 3;
                }
                else if (str.charCodeAt(pos) === 0x002d &&
                    identStartSequence(str, pos)) {
                    [token, pos] = consumeIdentLikeToken(str, pos);
                }
                else {
                    token = DELIM;
                    pos += 1;
                }
                break;
            case 0x002e:
                if (numberStartSequence(str, pos)) {
                    [token, pos] = consumeNumericToken(str, pos);
                }
                else {
                    token = DELIM;
                    pos += 1;
                }
                break;
            case IDENTSTART_RANGE:
                [token, pos] = consumeIdentLikeToken(str, pos);
                break;
            case 0x003c:
                if (str.charCodeAt(pos + 1) === 0x0021 &&
                    str.charCodeAt(pos + 2) === 0x002d &&
                    str.charCodeAt(pos + 3) === 0x002d) {
                    token = CDO;
                    pos += 4;
                }
                else {
                    token = DELIM;
                    pos += 1;
                }
                break;
            case 0x0023:
                if (ident(str.charCodeAt(pos + 1)) ||
                    escapeStartSequence(str, pos + 1)) {
                    pos = consumeIdentSequence(str, pos + 1);
                    token = HASH;
                }
                else {
                    token = DELIM;
                    pos += 1;
                }
                break;
            case 0x0040:
                if (identStartSequence(str, pos + 1)) {
                    pos = consumeIdentSequence(str, pos + 1);
                    token = AT_KEYWORD;
                }
                else {
                    token = DELIM;
                    pos += 1;
                }
                break;
            case 0x005c:
                if (escapeStartSequence(str, pos)) {
                    [token, pos] = consumeIdentLikeToken(str, pos);
                }
                else {
                    token = DELIM;
                    pos += 1;
                }
                break;
            case 0x002f:
                if (str.charCodeAt(pos + 1) === 0x002a) {
                    pos = str.indexOf("*/", pos + 2);
                    if (pos === -1)
                        pos = len;
                    token = COMMENT;
                    pos = pos === len ? pos : pos + 2;
                }
                else {
                    token = DELIM;
                    pos += 1;
                }
                break;
            case SPECIAL_DELIM_RANGE:
                token =
                    specialDelims[str.charCodeAt(pos)];
                pos += 1;
                break;
            default:
                token = DELIM;
                pos += 1;
        }
        yield [token, start, (start = pos)];
    }
}
export const value = (str, [token, start, end]) => {
    switch (token) {
        case COMMENT:
            return str.slice(start + 2, end - 2);
        case STRING: {
            const quote = str.charCodeAt(start);
            let value = "";
            for (let pos = start + 1; pos < end; pos += 1) {
                switch (str.charCodeAt(pos)) {
                    case quote:
                        return value;
                    case 0x005c:
                        if (pos + 1 === end && end === str.length) {
                            return value;
                        }
                        else if (newline(str.charCodeAt(pos + 1))) {
                            pos += 1;
                            break;
                        }
                        else if (escapeStartSequence(str, pos)) {
                            value += decodeEscapeSequence(str.slice(pos + 1, (pos = consumeEscapeSequence(str, pos))));
                            pos -= 1;
                            break;
                        }
                    default:
                        value += str[pos];
                }
            }
            return value;
        }
        case DELIM:
            return str[start];
        case PERCENTAGE:
        case DIMENSION:
        case NUMBER: {
            const numEnd = consumeNumberSequence(str, start);
            const chunk = str.slice(start, numEnd);
            const value = parseFloat(chunk) || 0;
            const type = chunk.includes(".") || chunk.includes("E") || chunk.includes("e")
                ? "number"
                : "integer";
            if (token === DIMENSION) {
                return {
                    type,
                    value,
                    unit: decodeIdentSequence(str.slice(numEnd, end)),
                };
            }
            return { type, value };
        }
        case HASH: {
            const type = identStartSequence(str, start + 1) ? "id" : "unrestricted";
            const value = decodeIdentSequence(str.slice(start + 1, end));
            return { type, value };
        }
        case AT_KEYWORD:
            start += 1;
        case FUNCTION:
        case IDENT:
            return decodeIdentSequence(str.slice(start, end));
        case URL: {
            let value = "";
            let pos = consumeIdentSequence(str, start) + 1;
            pos = consumeRangeSequence(str, pos, WHITESPACE_RANGE);
            while (pos < str.length) {
                let char = str[pos];
                if (char === ")") {
                    pos += 1;
                    break;
                }
                else if (quote(str.charCodeAt(pos)) ||
                    char === "(" ||
                    nonPrintable(str.charCodeAt(pos))) {
                    return null;
                }
                else if (char === "\\") {
                    if (escapeStartSequence(str, pos)) {
                        char = decodeEscapeSequence(str.slice(pos + 1, (pos = consumeEscapeSequence(str, pos))));
                    }
                    else {
                        return null;
                    }
                }
                else if (whitespace(str.charCodeAt(pos))) {
                    pos = consumeRangeSequence(str, pos, WHITESPACE_RANGE);
                    char = str[pos];
                    if (!char) {
                        break;
                    }
                    if (char === ")") {
                        pos += 1;
                        break;
                    }
                    else {
                        return null;
                    }
                }
                else {
                    pos += 1;
                }
                value += char;
            }
            return value;
        }
        default:
            return null;
    }
};
