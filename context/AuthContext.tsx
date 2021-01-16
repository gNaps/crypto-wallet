import { createContext, useState, useEffect } from 'react';
import { Magic } from 'magic-sdk';
import { MAGIC_PUBLIC_KEY } from '../utils/urls';
import { useRouter } from 'next/router';
import { any } from 'prop-types';
import { ethers } from 'ethers';

interface AuthContext {
    user: any;
    loginUser: (email: string) => void;
    logoutUser: () => void;
    checkUserLoggedIn: () => void;
    getToken: () => void;
    provider: any;
    providerMatic: any;
}

const AuthContext = createContext<AuthContext>({
    user: any,
    loginUser: (email: string) => {},
    logoutUser: () => {},
    checkUserLoggedIn: () => {},
    getToken: () => {},
    provider: any,
    providerMatic: any
});

let magic;
let magicMatic;
let provider;
let providerMatic;

export const AuthProvider = (props) => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    /**
     * Log the user in
     * @param {string} email
     */
    const loginUser = async (email) => {
        try {
            await magic.auth.loginWithMagicLink({ email });
            setUser({ email });
            router.push('/');
        } catch (err) {
            console.log(err);
        }
    };

    /**
     * Log the user out
     */
    const logoutUser = async () => {
        try {
            await magic.user.logout();
            setUser(null);
            router.push('/');
        } catch (err) {
            console.log(err);
        }
    };

    /**
     * If user is logged in, get data and display it
     */
    const checkUserLoggedIn = async () => {
        try {
            const isLoggedIn = await magic.user.isLoggedIn();

            if (isLoggedIn) {
                const { email } = await magic.user.getMetadata();
                setUser({ email });
                //Add this just for test
                const token = await getToken();
                console.log('checkUserLoggedIn token', token);
            }
        } catch (err) {
            console.log(err);
        }
    };

    /**
     * Retrieve Magic Issued Bearer Token
     * This allows User to make authenticated requests
     */
    const getToken = async () => {
        try {
            const token = await magic.user.getIdToken();
            localStorage.setItem('token', token);
            return token;
        } catch (err) {
            console.log(err);
        }
    };

    /**
     * Reload user login on app refresh
     */
    useEffect(() => {
        magic = new Magic(MAGIC_PUBLIC_KEY)
        provider = new ethers.providers.Web3Provider(magic.rpcProvider)

        magicMatic = new Magic(MAGIC_PUBLIC_KEY, {
            network: {rpcUrl: 'https://rpc-mainnet.matic.network', chainId: 137}
        })
        providerMatic = new ethers.providers.Web3Provider(magicMatic.rpcProvider)

        checkUserLoggedIn()
    }, []);

    return (
        <AuthContext.Provider value={{ user, logoutUser, loginUser, checkUserLoggedIn, getToken, provider, providerMatic }}>
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthContext;