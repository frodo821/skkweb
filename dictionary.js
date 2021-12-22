const KANA_TO_KATAKANA = {
  'ぴゅ': 'ピュ', 'びぇ': 'ビェ', 'ん': 'ン', 'ぬ': 'ヌ', 'が': 'ガ', 'せ': 'セ',
  'じぇ': 'ジェ', 'さ': 'サ', 'ど': 'ド', 'ぴょ': 'ピョ', 'ぱ': 'パ', 'ぃ': 'ィ',
  'な': 'ナ', 'じょ': 'ジョ', 'ば': 'バ', 'ざ': 'ザ', 'しょ': 'ショ', 'づ': 'ヅ',
  'ゆ': 'ユ', 'ヴぁ': 'ヴァ', 'ぐ': 'グ', 'だ': 'ダ', 'ちぇ': 'チェ', 'きぇ': 'キェ',
  'ぇ': 'ェ', 'む': 'ム', 'る': 'ル', 'きぃ': 'キィ', 'ぴぇ': 'ピェ', 'ふぁ': 'ファ',
  'ぎゃ': 'ギャ', 'きゅ': 'キュ', 'ふぃ': 'フィ', 'ひぇ': 'ヒェ', 'ちょ': 'チョ', 'びゃ': 'ビャ',
  'よ': 'ヨ', 'ぎょ': 'ギョ', 'く': 'ク', 'へ': 'ヘ', 'あ': 'ア', 'べ': 'ベ',
  'お': 'オ', 'ぉ': 'ォ', 'ほ': 'ホ', 'くぃ': 'クィ', 'ヴぇ': 'ヴェ', 'び': 'ビ',
  'くぇ': 'クェ', 'げ': 'ゲ', 'た': 'タ', 'ー': 'ー', 'ぎぃ': 'ギィ', 'ぼ': 'ボ',
  'ひ': 'ヒ', 'びゅ': 'ビュ', 'にゃ': 'ニャ', 'きょ': 'キョ', 'す': 'ス',
  'か': 'カ', 'わ': 'ワ', 'ぴ': 'ピ', 'う': 'ウ', 'ヴぃ': 'ウィ',
  'いぇ': 'イェ', 'を': 'ヲ', 'じゃ': 'ジャ', 'れ': 'レ', 'ね': 'ネ',
  'ちゅ': 'チュ', 'しぃ': 'シィ', 'ぷ': 'プ', 'にゅ': 'ニュ', 'じぃ': 'ジィ', 'っ': 'ッ',
  'ぜ': 'ゼ', 'こ': 'コ', 'じ': 'ジ', 'ぢ': 'ヂ', 'ひゃ': 'ヒャ', 'は': 'ハ',
  'や': 'ヤ', 'にょ': 'ニョ', 'つ': 'ツ', 'と': 'ト', 'ちゃ': 'チャ', 'で': 'デ',
  'ぎ': 'ギ', 'ぴゃ': 'ピャ', 'ぎゅ': 'ギュ', 'しゃ': 'シャ', 'み': 'ミ', 'しゅ': 'シュ',
  'ひぃ': 'ヒィ', 'にぃ': 'ニィ', 'ご': 'ゴ', 'ふぇ': 'フェ', 'ふぉ': 'フォ', 'ぎぇ': 'ギェ',
  'ヴぉ': 'ヴォ', 'り': 'リ', 'て': 'テ', 'びょ': 'ビョ', 'も': 'モ', 'うぃ': 'ウィ',
  'ら': 'ラ', 'ぴぃ': 'ピィ', 'くぉ': 'クォ', 'びぃ': 'ビィ', 'じゅ': 'ジュ', 'ち': 'チ',
  'め': 'メ', 'ひょ': 'ヒョ', 'うぇ': 'ウェ', 'ぽ': 'ポ', 'ちぃ': 'チィ', '。': '。',
  'ず': 'ズ', 'そ': 'ソ', 'ぞ': 'ゾ', 'くぁ': 'クァ', 'きゃ': 'キャ', 'ぺ': 'ペ',
  'ま': 'マ', 'ぶ': 'ブ', 'ヴ': 'ヴ', 'ふ': 'フ', 'しぇ': 'シェ', 'にぇ': 'ニェ',
  'え': 'エ', '、': '、', 'ろ': 'ロ', 'に': 'ニ', 'き': 'キ', 'し': 'シ',
  'の': 'ノ', 'ぁ': 'ァ', 'け': 'ケ', 'い': 'イ', 'ぅ': 'ゥ'
}

class Dictionary {
  constructor() {
    this.initialized = false;
    this.dict = {}

    fetch("/dictionary.txt").then(resp => {
      if (!resp.ok) {
        throw new Error("Failed to fetch dictionary");
      }
      return resp.text();
    }).then(text => {
      text.split('\n').forEach(li => {
        let [kana, kanji, priority] = li.split(',');
        (this.dict[kana] || (this.dict[kana] = [])).push({ kanji, priority });
      });

      Object.values(this.dict).forEach(list => { list.sort((a, b) => a.priority - b.priority) });

      this.initialized = true;
      console.log('dictionary initialization completed.');
    });
  }

  lookup(kana, rank) {
    if (!this.initialized) {
      return kana;
    }

    let list = [...(this.dict[kana] || []), { kanji: this.buildKatakana(kana) }];

    return list[rank % list.length].kanji;
  }

  buildKatakana(kana) {
    let katakana = "";
    for (let i = 0; i < kana.length; i++) {
      katakana += KANA_TO_KATAKANA[kana[i]] || kana[i];
    }
    console.log(katakana);
    return katakana;
  }
}
