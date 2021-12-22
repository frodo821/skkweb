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

    let list = this.dict[kana];

    if (!list) {
      return kana;
    }

    return list[rank % list.length].kanji;
  }
}
