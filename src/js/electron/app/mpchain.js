class Mpchain {
    static async createSend(from, to, quantity, feePerKb, disableUtxoLocks=true) {
        const params = {
            source: from,
            destination: to,
            asset: "MONA",
            quantity: parseInt(quantity),
            memo: null,
            memo_is_hex: "no",
            fee_per_kb: parseInt(feePerKb * 1000),
            allow_unconfirmed_inputs: true,
            extended_tx_info: true,
            disable_utxo_locks: disableUtxoLocks,
        }
        return await this.#request(this.#makeParams('create_send', params))
    }
    static #makeParams(method, params, isParty=true) { // method:str, params:obj, isParty:bool(true:counterParty, false:counterBlock)
        return {
            id: 0,
            jsonrpc: "2.0",
            method: (isParty) ? "proxy_to_counterpartyd" : method,
            params: (isParty) ? {method: method, params: params} : params,
        }
    }
    static async #request(data, isPost=true) {
        console.log(data)
        const URL = `https://mpchain.info/api/cb/`
        const METHOD = (isPost) ? 'POST' : 'GET'
        const HEADERS = { 'Content-Type': 'application/json' }
        const options = { method: METHOD, headers: HEADERS }
        if (isPost) { options.body = JSON.stringify(data) }
        //const res = await fetch(URL, options)
        //return await res.json()
        return await window.ipc.fetch(URL, options)
    }
}
