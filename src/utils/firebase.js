import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { VOUCHER_CARDS } from "./util";



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyDf_-7HQHxuziIBGvXcklHeJjTV4kwC3dE",
//     authDomain: "saita-card.firebaseapp.com",
//     projectId: "saita-card",
//     storageBucket: "saita-card.appspot.com",
//     messagingSenderId: "312879040963",
//     appId: "1:312879040963:web:f238867f958f0a72065576",
//     measurementId: "G-12W9Y5QY2E"
// };

// mainnet-firebase-config
// const firebaseConfig = {
//     apiKey: "AIzaSyDB5iYqDuRRKR7eq_NfW3l8GXVIupvdCH8",
//     authDomain: "saita-card-mainnet.firebaseapp.com",
//     projectId: "saita-card-mainnet",
//     storageBucket: "saita-card-mainnet.appspot.com",
//     messagingSenderId: "1039029677371",
//     appId: "1:1039029677371:web:ea760ede078ed37a351b1e",
//     measurementId: "G-Y8EEBYHM76"
// };
// test-net config
const firebaseConfig = {
    apiKey: "AIzaSyAaC4rvPXjwp3ZB1wyFCj6od5kMv1NZSJ0",
    authDomain: "saita-card-goerli.firebaseapp.com",
    projectId: "saita-card-goerli",
    storageBucket: "saita-card-goerli.appspot.com",
    messagingSenderId: "217740935843",
    appId: "1:217740935843:web:a86bf97d3110d6cbf4f516",
    measurementId: "G-JPKL12C6RY"
  };
// const firebaseConfig = {
//     apiKey: "AIzaSyBmYhcsLql_7sjkhBF8fAvI_1w2ZaRvhc8",
//     authDomain: "saitacard-c3baf.firebaseapp.com",
//     projectId: "saitacard-c3baf",
//     storageBucket: "saitacard-c3baf.appspot.com",
//     messagingSenderId: "964458973990",
//     appId: "1:964458973990:web:247846cca4e614d2e64fe7",
//     measurementId: "G-W9BPR6DQ4V"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const addVouchers = async () => {
    try {

        const data = VOUCHER_CARDS.map((voucher) => {
            return {
                voucher,
                address: '',
                token_id: ''
            };
        })
        await setDoc(doc(db, "vouchers", "voucher-ids"), { data });


    } catch (e) {
        console.error("Error adding document: ", e);
    }

}

const readVouchers = async () => {

    const washingtonRef = doc(db, "vouchers", "voucher-ids");
    const voucher_data = await getDoc(washingtonRef);
    const data = voucher_data.data().data;

    return data

}
const hasVoucher = async (address) => {
    // filter firebase docs for the address

    const vouchers = await readVouchers();

    const has = vouchers.filter((voucher) => voucher.address === address);
    return has;
}

const assignVoucher = async (token_ids = [], address) => {
    const length = token_ids.length;

    const washingtonRef = doc(db, "vouchers", "voucher-ids");

    const vouchers = await readVouchers()


    const has = vouchers.filter((voucher) => voucher.address === address);


    if (has.length >= length) {
        return;
    }


    token_ids.forEach((token_id) => {
        for (let j = 0; j < vouchers.length; j++) {
            if (token_id === vouchers[j].token_id) {
                vouchers[j].address = address;
                break;
            } else if (vouchers[j].token_id === '') {
                vouchers[j].token_id = token_id;
                vouchers[j].address = address;
                break;
            }
        }
    })




    await updateDoc(washingtonRef, { data: vouchers });
}

export const firestore_db = {
    addVouchers,
    readVouchers,
    assignVoucher,
    hasVoucher
};
