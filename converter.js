const ROMAN_TO_KANA = {
  "u": "あ", "e": "い", "o": "う", "a": "え", "i": "お",
  "fu": "か", "fe": "き", "fo": "く", "fa": "け", "fi": "こ",
  "yu": "さ", "ye": "し", "yo": "す", "ya": "せ", "yi": "そ",
  "gu": "た", "ge": "ち", "go": "つ", "ga": "て", "gi": "と",
  "mu": "な", "me": "に", "mo": "ぬ", "ma": "ね", "mi": "の",
  "qu": "は", "qe": "ひ", "qo": "ふ", "qa": "へ", "qi": "ほ",
  "vu": "ま", "ve": "み", "vo": "む", "va": "め", "vi": "も",
  "pu": "や", "pe": "い", "po": "ゆ", "pa": "いぇ", "pi": "よ",
  "cu": "ら", "ce": "り", "co": "る", "ca": "れ", "ci": "ろ",
  "su": "わ", "se": "うぃ", "so": "う", "sa": "うぇ", "si": "を",
  "m": "ん", "mm": "ん", "gso": "つ", "-": "ー", ".": "。", ",": "、",
  "ku": "か", "ke": "し", "ko": "く", "ka": "せ", "ki": "こ",
  "xu": "ば", "xe": "び", "xo": "ぶ", "xa": "べ", "xi": "ぼ",
  "bu": "だ", "be": "ぢ", "bo": "づ", "ba": "で", "bi": "ど",
  "wu": "ふぁ", "we": "ふぃ", "wo": "ふ", "wa": "ふぇ", "wi": "ふぉ",
  "nu": "が", "ne": "ぎ", "no": "ぐ", "na": "げ", "ni": "ご",
  "du": "じゃ", "de": "じ", "do": "じゅ", "da": "じぇ", "di": "じょ",
  "lu": "ぁ", "le": "ぃ", "lo": "ぅ", "la": "ぇ", "li": "ぉ", "lto": "っ",
  "hu": "ぱ", "he": "ぴ", "ho": "ぷ", "ha": "ぺ", "hi": "ぽ",
  "ju": "くぁ", "je": "くぃ", "jo": "く", "ja": "くぇ", "ji": "くぉ",
  "tu": "ヴぁ", "te": "ヴぃ", "to": "ヴ", "ta": "ヴぇ", "ti": "ヴぉ",
  "zu": "ぁ", "ze": "ぃ", "zo": "ぅ", "za": "ぇ", "zi": "ぉ", "zto": "っ",
  "ru": "ざ", "re": "じ", "ro": "ず", "ra": "ぜ", "ri": "ぞ",
  "khu": "ちゃ", "khe": "ち", "kho": "ちゅ", "kha": "ちぇ", "khi": "ちょ",
  "fyu": "きゃ", "fye": "きぃ", "fyo": "きゅ", "fya": "きぇ", "fyi": "きょ",
  "yyu": "しゃ", "yye": "しぃ", "yyo": "しゅ", "yya": "しぇ", "yyi": "しょ",
  "gyu": "ちゃ", "gye": "ちぃ", "gyo": "ちゅ", "gya": "ちぇ", "gyi": "ちょ",
  "myu": "にゃ", "mye": "にぃ", "myo": "にゅ", "mya": "にぇ", "myi": "にょ",
  "qyu": "ひゃ", "qye": "ひぃ", "qyo": "ひょ", "qya": "ひぇ", "qyi": "ひょ",
  "hyu": "ぴゃ", "hye": "ぴぃ", "hyo": "ぴゅ", "hya": "ぴぇ", "hyi": "ぴょ",
  "xyu": "びゃ", "xye": "びぃ", "xyo": "びゅ", "xya": "びぇ", "xyi": "びょ",
  "ryu": "じゃ", "rye": "じぃ", "ryo": "じゅ", "rya": "じぇ", "ryi": "じょ",
  "nyu": "ぎゃ", "nye": "ぎぃ", "nyo": "ぎゅ", "nya": "ぎぇ", "nyi": "ぎょ",
};

const ROMANS = Object.keys(ROMAN_TO_KANA).sort((a, b) => (b.length - a.length));

class Converter {
  constructor() {
    this.buffer = "";
    this.kana = null;
    this.counter = 0;
    this.dict = new Dictionary();
    this.converting = false;
  }

  get empty() {
    return this.buffer.length === 0;
  }

  append(char) {
    this.buffer += char;
  }

  removeLast() {
    this.buffer = this.buffer.slice(0, -1);
  }

  convert() {
    if (!this.converting) {
      if (/^[a-z]/.test(this.buffer)) {
        this.buffer = this.convertKana();
      } else {
        this.buildKana();
      }
      this.converting = true;
    }

    if (this.kana === null) {
      return this.buffer;
    }

    this.buffer = this.dict.lookup(this.kana, this.counter++);
    return this.buffer;
  }

  convertKana() {
    if (this.kana == null) {
      this.buildKana();
    }

    let kana = this.kana;
    this.clear();
    return kana;
  }

  buildKana() {
    let tr = "";
    let buf = this.buffer.toLowerCase();

    while (buf) {
      let conv = false;
      for (let i = 0; i < ROMANS.length; i++) {
        let roman = ROMANS[i];
        if (buf.startsWith(roman)) {
          tr += ROMAN_TO_KANA[roman];
          buf = buf.slice(roman.length);
          conv = true;
          break;
        }
      }

      if (!conv) {
        tr += buf[0];
        buf = buf.slice(1);
      }
    }

    this.buffer = '';
    this.kana = tr;
  }

  clear() {
    this.buffer = '';
    this.kana = null;
    this.counter = 0;
    this.converting = false;
  }

  confirm() {
    let kanji = this.buffer;
    this.clear();
    return kanji;
  }
}
