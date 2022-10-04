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
            document.querySelector(`#result`).value = JSON.stringify(
                await Mpchain.createSend(...values))
        })
    }
    createSend()
});
window.addEventListener('beforeunload', async(event) => {
    console.log('beforeunload!!');
});

