import Head from 'next/head';
import { useContext, useState } from 'react';
import { Magic } from 'magic-sdk';
import { MAGIC_PUBLIC_KEY } from '../utils/urls';
import { ethers } from 'ethers';

import AuthContext from '../context/AuthContext';

import styles from '../styles/Home.module.css';


export default function Home() {
    const { user, provider, providerMatic } = useContext(AuthContext)
    const [ address, setAddress ] = useState('')
    const [ usdc, setUsdc ] = useState(0)
    const [ matic, setMatic ] = useState(false)
    
    /**
     * Given an address return the amount of usdc 
     * @param e 
     * @param address 
     */
    const readFromContract = async (e: any, address: string) => {
        e.preventDefault()

        const abi = ["function balanceOf(address owner) view returns (uint256)"]
        let contractAddress: string
        let signer: any

        if(matic) {
            contractAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
            signer = providerMatic.getSigner()
        } else {
            contractAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
            signer = provider.getSigner()
        }

        const contract = new ethers.Contract(
            contractAddress,
            abi,
            signer
        );

        const message = await contract.balanceOf(address)

        const number = message.toString()
        const numberParsed = ethers.utils.formatUnits(number, 'mwei')

        console.log('number parsed ', numberParsed)

        setUsdc(parseFloat(numberParsed))
    }

    return (
        <div>
            <Head>
                <title>Crypto Wallet</title>
                <meta
                    name="description"
                    content="Crypto Wallet"
                />
            </Head>

            {!user &&
                <h1>
                    Please login with Magic!
                </h1>
            } 

            {user && 
                <>
                <div className={styles.networks}>
                    <h4 className={matic ? `` : `${styles.active}`} onClick={() => setMatic(false)}>Mainnet</h4>
                    <h4 className={matic ? `${styles.active}` : ``} onClick={() => setMatic(true)}>Matic</h4>
                </div>
                <form onSubmit={(e) => readFromContract(e, address)} className={styles.form_market}>
                    <h2>Digit your address</h2>
                    <input
                        type="text"
                        value={address}
                        name='address'
                        onChange={(e) => setAddress(e.target.value)} />
                    
                    <button type='submit'>How much usdc?</button>
                </form>
                <h6>
                    {usdc}
                </h6>
                </>
            }
        </div>
    );
}

//usdc address 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48