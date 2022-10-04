mpchain APIのcreate_sendを叩く【Electron】
create_sendのtxHexからTransactionデータをデコードする
bitcoinjs-libでcreate_sendのtxHexからTransactionデータをデコードする

　謎の16進数テキストから取引オブジェクトに変換できた。

<!-- more -->

# ブツ

* [リポジトリ][]

![eye-catch.png][リポジトリ]

[リポジトリ]:https://github.com/ytyaru/Electron.bitcoinjs.lib.transaction.20221004120314
[eye-catch.png]:eye-catch.png

# 実行

```sh
NAME='Electron.bitcoinjs.lib.transaction.20221004120314'
git clone https://github.com/ytyaru/$NAME
cd $NAME
./run.sh
```

環境|version
----|-------
Node.js|18.10.0
Electron|21.0.1

# 調査

　[create_send][]の戻り値は以下のようなものだった。

```javascript
{"id":0,"jsonrpc":"2.0","result":{"btc_change":101556960,"btc_fee":2250,"btc_in":112970610,"btc_out":11411400,"tx_hex":"0100000001737a59194d5705b49f8e7c262d97d5cfd1e31ba5f6a7590402634bcbd71c53e9010000001976a91445fc13c9d3a0df34008291492c39e0efcdd220b888acffffffff02c81fae00000000001976a91445fc13c9d3a0df34008291492c39e0efcdd220b888ace0a20d06000000001976a91445fc13c9d3a0df34008291492c39e0efcdd220b888ac00000000"}}
```

　これは指定したアドレスや金額に応じてトランザクション情報を返してくれたもののはず。それらしきものは`tx_hex`なのだが、名前や値から察するに16進数化されている。これをデコードすることでJSONにできるはず。それをするのがbitcoinjs-libのはず。

　bitcoinjs-libのリポジトリで`txHex`を引数にとっているメソッドがあれば、それが16進数値からJSONへデコードするメソッドにちがいない。

　そう当たりをつけてコード検索をかけた。

* [bitcoinjs-lib search txHex][]

[bitcoinjs-lib search txHex]:https://github.com/bitcoinjs/bitcoinjs-lib/search?q=txHex&type=
[blocks.spec.ts]:https://github.com/bitcoinjs/bitcoinjs-lib/blob/239711bf4ef00651af92049bcdf88b12252b945c/test/integration/blocks.spec.ts#L17

　すると[blocks.spec.ts][]にそれらしき箇所を発見した。

```javascript
    const tx = bitcoin.Transaction.fromHex(txHex);
```

　今回はこのメソッドに[create_send][]の戻り値である`tx_hex`を渡してみた。すると想定通りトランザクションの入力と出力がセットされたオブジェクトが返ってきた！

# コード抜粋

　今回のポイントはここ。

```javascript
const bitcoin = require('bitcoinjs-lib')
const tx = bitcoin.Transaction.fromHex(txHex);
```

　これをElectronのIPC通信インタフェースにする。

## main.js

```javascript
ipcMain.handle('decodeTxHex', async(event, txHex)=>{
    console.log(txHex)
    const tx = bitcoin.Transaction.fromHex(txHex);
    console.log(tx)
    return tx
})
```

## preload.js

```javascript
decodeTxHex:async(txHex)=>await ipcRenderer.invoke('decodeTxHex', txHex),
```

## renderer.js

　呼び出す。[create_send][]で`tx_hex`を入手したら、それを`decodeTxHex`に渡す。

```javascript
const json = await Mpchain.createSend(...values)
const tx = await window.ipc.decodeTxHex(json.result.tx_hex)
```

# 結果

## create_send

```javascript
{"id":0,"jsonrpc":"2.0","result":{"btc_change":101556960,"btc_fee":2250,"btc_in":112970610,"btc_out":11411400,"tx_hex":"0100000001737a59194d5705b49f8e7c262d97d5cfd1e31ba5f6a7590402634bcbd71c53e9010000001976a91445fc13c9d3a0df34008291492c39e0efcdd220b888acffffffff02c81fae00000000001976a91445fc13c9d3a0df34008291492c39e0efcdd220b888ace0a20d06000000001976a91445fc13c9d3a0df34008291492c39e0efcdd220b888ac00000000"}}
```

## decodeTxHex

```javascript
{"version":1,"locktime":0,"ins":[{"hash":{"0":115,"1":122,"2":89,"3":25,"4":77,"5":87,"6":5,"7":180,"8":159,"9":142,"10":124,"11":38,"12":45,"13":151,"14":213,"15":207,"16":209,"17":227,"18":27,"19":165,"20":246,"21":167,"22":89,"23":4,"24":2,"25":99,"26":75,"27":203,"28":215,"29":28,"30":83,"31":233},"index":1,"script":{"0":118,"1":169,"2":20,"3":69,"4":252,"5":19,"6":201,"7":211,"8":160,"9":223,"10":52,"11":0,"12":130,"13":145,"14":73,"15":44,"16":57,"17":224,"18":239,"19":205,"20":210,"21":32,"22":184,"23":136,"24":172},"sequence":4294967295,"witness":[]}],"outs":[{"value":11411400,"script":{"0":118,"1":169,"2":20,"3":69,"4":252,"5":19,"6":201,"7":211,"8":160,"9":223,"10":52,"11":0,"12":130,"13":145,"14":73,"15":44,"16":57,"17":224,"18":239,"19":205,"20":210,"21":32,"22":184,"23":136,"24":172}},{"value":101556960,"script":{"0":118,"1":169,"2":20,"3":69,"4":252,"5":19,"6":201,"7":211,"8":160,"9":223,"10":52,"11":0,"12":130,"13":145,"14":73,"15":44,"16":57,"17":224,"18":239,"19":205,"20":210,"21":32,"22":184,"23":136,"24":172}}]}
```

　`ins`が入力、`outs`が出力。`outs`の`value`には支払額やおつりが入っている。あれ、でも`ins`のほうに`value`がない。なぜ？

　このトランザクションデータは暗号通貨の取引データそのもののはず。

# 今後

　あとはこのデータに署名して、そのデータをブロードキャストすれば取引を依頼できたことになる。この時点で「承認待ち」となる。その後はマイナーがマイニングして「承認済み」となれば、その取引が確定する。

　そういう流れだということはわかっている。問題はそれをソースコードに落とし込む所。署名とブロードキャストを実装すれば、あとは待つだけ。そこまでたどり着けるかな？

　でも先が見えてきた。Node.jsで送金できるようになるかもしれない。がんばろう。

