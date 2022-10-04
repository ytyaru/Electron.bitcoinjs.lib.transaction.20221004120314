window.addEventListener('DOMContentLoaded', async(event) => {
    const throttle = new Throttle()
    const ids = ['from', 'to', 'quantity', 'fee-per-kb']
    for (const id of ids) { 
        document.getElementById(id).addEventListener('input', async(event) => {
            createSend({ id: event.target.id, value: event.target.value })
        })
    }
    function createSend(d=null) {
        const values = ids.map(id=>document.getElementById(id).value)
        if (d) { values[ids.find(id=>id === d.id)] = d.value }
        throttle.run(async()=>{
            const json = await Mpchain.createSend(...values)
            document.querySelector(`#result-create-send`).value = JSON.stringify(json)
            console.log(json.result.tx_hex)
            const tx = await window.ipc.decodeTxHex(json.result.tx_hex)
            console.log(tx)
            document.querySelector(`#result-decode-tx-hex`).value = JSON.stringify(tx)
        })
    }
    createSend()
})
window.addEventListener('beforeunload', async(event) => {
    console.log('beforeunload!!');
});

