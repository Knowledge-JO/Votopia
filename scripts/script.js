import { ethers } from "./ethersJS/ethers-5.1.esm.min.js";
import { votopiaABI } from "./ABI/contractABI.js"

const voters_form = document.querySelector('#v-form');
const wallet_btn = document.querySelector('.connect-wallet-btn');
const notify = document.querySelector('.content');
const notify_background = document.querySelector('.notify');
let loader = document.getElementById('loader');
const result = document.querySelector('.check-result')
const contractAddress = '0x90db67E14985c7f17cb7dC474c441534F95Ec653';

const connected = false;

window.addEventListener('load', () => {

    loader.classList.add('remove-loader')

})

wallet_btn.addEventListener('click', async () => {
    let {truncatedAddr} = await connect_metamask()
    if (!truncatedAddr) return;
    wallet_btn.textContent = truncatedAddr;
})

voters_form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await vote(voters_form.resources.value)
})

result.addEventListener ('click', async () => {
    const name = await winning()
    notify_background.classList.add('success')
    notify.textContent = `Winning proposal is: ${name}`
})

const connect_metamask = async () => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const chainID = await signer.getChainId();
        if( chainID !== 80001 ){
            try{
                await provider.send("wallet_switchEthereumChain", [{ chainId: `0x13881` },]);
            } catch (err) {
                console.log("Error requesting account switch: ", err)
                return;
            }
        }
        
        const address = await signer.getAddress();

        const truncatedAddr = address.slice(0, 4) + "..." + address.slice(-3)

        return {truncatedAddr, signer, address}
    } catch (err) {
        console.log('Error connecting to metamask: ', err)
    }
}


const vote = async (proposal) => {
    try {
        const {signer, address} = await connect_metamask()
        let receipt;

        const votopia = new ethers.Contract(contractAddress, votopiaABI, signer);
        const voterInfo = await votopia.voters(address)

        const hasVoted = voterInfo.anyvotes;
        console.log(hasVoted)

        if (hasVoted) {
            console.log("Already voted");
        } else {
            console.log("Voting...");
        }

        const transaction = await votopia.vote(proposal);

        receipt = transaction.wait(1);

        console.log("Vote submitted successfully!");
        console.log(notify.textContent)
        updateNotifyUI("Vote Successful", "success")

    } catch (err) {
        updateNotifyUI(err.data.message, "failed")
        console.log("Failed, reason: ", err.message);
    }
}

const winning = async () => {

    // try {
        const {signer} = await connect_metamask();
    
        const votopia = new ethers.Contract(contractAddress, votopiaABI, signer);

        let name = await votopia.winningName();

        let winner =  ethers.utils.parseBytes32String(name);

        return winner;
    // } catch (err){
    //     console.log(err.data.message)
    // }
    
}

const updateNotifyUI = (message, status) => {
    if(!message) return;
    notify_background.classList.add(status);
    notify.textContent = message;
}