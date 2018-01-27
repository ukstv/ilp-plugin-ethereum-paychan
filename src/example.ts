import PluginEthereumPaychan from './index'
import * as Web3 from 'web3'
import * as util from 'util'
import * as BigNumber from 'bignumber.js'
const promisify = util.promisify

async function main () {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    const accounts = await promisify(web3.eth.getAccounts)()
    const senderAccount = accounts[0]
    const receiverAccount = accounts[1]

    const sender = new PluginEthereumPaychan({
        account: senderAccount,
        server: 'http://localhost:3000',
        db: 'sender_db'
    })
    const receiver = new PluginEthereumPaychan({
        account: receiverAccount,
        port: 3000,
        db: 'receiver_db'
    })
    receiver.registerDataHandler((buffer) => Promise.resolve(Buffer.alloc(32, 255)))
    receiver.registerMoneyHandler((amount) => console.log(`receiver got: ${amount} unit of money`))

    await receiver.connect()
    await sender.connect()

    const response = await sender.sendData(Buffer.alloc(32, 0))
    console.log('receiver responded:', response.toString('hex'))
    await sender.sendMoney(new BigNumber.BigNumber(1))

    await receiver.disconnect()
    await sender.disconnect()
    process.exit(0)
}

main().catch(err => console.log(err))
