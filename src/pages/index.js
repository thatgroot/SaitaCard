import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/evm-utils";
import web3ModalSetup from "./../helpers/web3ModalSetup";
import Web3 from "web3";
import { RUN_MODE, MAINNET, API_KEY, NFT_ADDRESS } from "../constant";
import * as action from "../store/actions";
import * as selector from "../store/selectors";
import { firestore_db } from "../utils/firebase";

const web3Modal = web3ModalSetup();
const chain = MAINNET === 1 ? EvmChain.ETHEREUM : EvmChain.GOERLI;
const btnData = {
  title: "CLAIM OR GET YOUR SAITACARD BLACK VOUCHER",
  description:
    "Click to connect your wallet and claim your voucher. This voucher will be used when applying to SaitaCard to remove application fees.",
};
const ruleData = {
  title: "Rules and regulations:",
  description: [
    ({showForm}) => (
      <p>
        After claiming your voucher, fill up <b onClick={()=>{ showForm(true) }} style={{cursor:"pointer", color:"blue",}}>THIS FORM</b> and enter your
        voucher. You will receive an email within a few days with the next
        steps. Access the form here:{" "}
        <a href={"https://bit.ly/SaitaCardClaim"}>
          https://bit.ly/SaitaCardClaim
        </a>{" "}
      </p>
    ),
    `If you hold a copy of the Paper Village NFT #1 (mixed style houses) you are eligible for a SaitaCard Gold free of registration fees. Please connect the wallet that holds the NFT to get your voucher.`,
    `One voucher will be available per NFT. If you hold more than one NFT, you will get the corresponding amount of vouchers.`,
    `Vouchers are transferable once claimed. You are free to give them to family members or friends, but they can't be sold. Cards will be invalidated in that case.`,
    `If you transfer the NFT to another person or wallet and you haven't used your voucher, that wallet will now be eligible for the voucher.`,
    `Vouchers can be used only once. Before purchasing the NFT from a holder please confirm if they already used the SaitaCard Gold voucher.`,
    () => (
      <p>
        <b>ATTENTION</b>: we will never ask for your Seed Phrase, this is a
        simple DApp (decentralized application) that can't control your wallets.
      </p>
    ),
  ],
};
const footer = {
  title: "For support:",
  email: "info@saitamatoken.com",
};

const Form = ({ onClose }) => {
  return (
    <div>
      <span
        onClick={onClose}
        style={{
          color: "white",
          fontSize: "24px",
          fontWeight: "bolder",
          textAlign: "right",
          cursor:"pointer©"
        }}
      >
        X
      </span>
      <iframe
        title={"Subscription Form"}
        width="540"
        height="305"
        src="https://fc2d821b.sibforms.com/serve/MUIFAKlXVSkNqtP-GOfiSHrolrZrqh6agfzcbZibhF-3zH_XXfkeeGOSpcjdoReUboD8kjSzPclTyvfeQWT7rq3LaH6yLGnQ--6Om5SiZRERUc8lmQqeY-IKYUg6TvLvQEovZ4GIJo0o9vBmP_2QEmXHfrfJ8T_J_S5YyinKJovyhOPVLIJZXXOajFnW5joDmuAEF1UPI46NHvkH"
        frameborder="0"
        allowfullscreen
        style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "100%",
        }}
      ></iframe>
    </div>
  );
};
const Home = () => {
  const dispatch = useDispatch();

  const isStarted = useSelector(selector.isConnectedState);
  const injectedProvider = useSelector(selector.injectedProviderState);
  const curAcount = useSelector(selector.curAcountState);

  const [refetch, setRefetch] = useState(false);

  const [nftAmount, setNftAmount] = useState([]);
  const [claim, setClaim] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const logoutOfWeb3Modal = async () => {
    // alert("logoutOfWeb3Modal");
    web3Modal.clearCachedProvider();

    if (
      injectedProvider &&
      injectedProvider.provider &&
      typeof injectedProvider.provider.disconnect === "function"
    ) {
      await injectedProvider.provider.disconnect();
    }

    dispatch(action.setCurAcount(null));

    window.location.reload();
  };

  const loadWeb3Modal = useCallback(async () => {
    // alert("loadWeb3Modal");
    RUN_MODE("Connecting Wallet...");
    const provider = await web3Modal.connect();
    // alert("loadWeb3Modal1");
    const web3Provider = new Web3(provider);
    // alert("loadWeb3Modal2");
    dispatch(action.setInjectedProvider(web3Provider));
    // alert(JSON.stringify(provider));
    var acc = null;
    try {
      // alert("loadWeb3Modal try");
      acc = provider.selectedAddress
        ? provider.selectedAddress
        : provider.accounts[0];
    } catch (error) {
      // alert("loadWeb3Modal catch");
      acc = provider.address;
    }
    // alert(`loadWeb3Modal4 ${acc}`);

    const _curChainId = await web3Provider.eth.getChainId();
    // if (_curChainId !== MAINNET) {
    //     alert('Wrong Network! Please switch to Ethereum Mainnet!')
    //     return;
    // }
    // alert("loadWeb3Modal6");

    dispatch(action.setWeb3(web3Provider));
    dispatch(action.setCurAcount(acc));

    provider.on("chainChanged", (chainId) => {
      RUN_MODE(`chain changed to ${chainId}! updating providers`);
      // alert("loadWeb3Modal chainChanged");
      // alert('Wrong Network! Please switch to Ethereum Mainnet!')
      dispatch(action.setInjectedProvider(web3Provider));
      logoutOfWeb3Modal();
    });

    provider.on("accountsChanged", () => {
      RUN_MODE(`curAcount changed!`);
      // alert("loadWeb3Modal accountsChanged");
      alert("Current Account Changed!");
      dispatch(action.setInjectedProvider(web3Provider));
      logoutOfWeb3Modal();
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      RUN_MODE(code, reason);
      // alert("loadWeb3Modal accountsChanged");
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [dispatch]);

  useEffect(() => {
    // firestore_db.addVouchers()
    const moralisStart = async () => {
      if (!isStarted) {
        await Moralis.start({ apiKey: API_KEY });
        dispatch(action.setIsStarted(true));
      }
    };
    moralisStart();
    const timerID = setInterval(() => {
      setRefetch((prevRefetch) => {
        return !prevRefetch;
      });
    }, 300000);

    return () => {
      clearInterval(timerID);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (curAcount && claim) {
          const response = await Moralis.EvmApi.nft.getWalletNFTs({
            chain,
            address: curAcount,
            tokenAddresses: [NFT_ADDRESS],
            limit: 100,
          });
          RUN_MODE(response?.result.map((value, index) => value._data.tokenId));
          setNftAmount(
            response?.result.map((value, index) => value._data.tokenId)
          );
          setIsPending(true);
          firestore_db.hasVoucher(curAcount).then((vouchers_array) => {
            setMyVouchers(vouchers_array);
          });
        }
      } catch (error) {
        RUN_MODE("fetchData error: ", error);
      }
    };

    fetchData();
  }, [refetch, curAcount, claim]);

  const [displayMessage, setDisplayMessage] = useState([]);

  useEffect(() => {
    firestore_db.hasVoucher(curAcount).then((vouchers_array) => {
      setMyVouchers(vouchers_array);
    });
  }, [curAcount]);

  useEffect(() => {
    if (curAcount && claim) {
      if (nftAmount.length > 0) {
        firestore_db.assignVoucher(nftAmount, curAcount).then(() => {
          firestore_db.hasVoucher(curAcount).then((vouchers_array) => {
            setMyVouchers(vouchers_array);
          });
        });
      }
    }
  }, [claim, curAcount, nftAmount]);

  useEffect(() => {
    console.log("curAccount,claim,isPending", curAcount, claim, isPending);
    if (curAcount && claim) {
      if (nftAmount.length > 0) {
        setDisplayMessage([
          "Wallet validated. Here's your voucher(s).",
          "Please copy and save these vouchers in a secure place. Do not show it publicly, once used they will be invalidated.",
        ]);
      } else if (isPending) {
        setDisplayMessage([
          "Wallet not eligible for a voucher.",
          `The wallet you used is not holding a copy of the NeonDowntown NFT. Please try another wallet. Make sure you purchased an original copy of the NFT by checking the contract.`,
        ]);
      } else {
        setDisplayMessage([
          `Fetching... Please wait a few seconds.`,
          `Please wait a few seconds.`,
        ]);
      }
    }
  }, [curAcount, claim, nftAmount.length, isPending]);

  const onClaim = () => {
    if (curAcount) {
      setClaim(true);
    }
  };

  const [my_vouchers, setMyVouchers] = useState([null]);

  const cond = curAcount && claim;

  return (
    <>
      <br />

      <div
        className="logo-desktop"
        style={{
          marginLeft: "-10px",
        }}
      />

      {showForm && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000eae1f",
            zIndex: "999",
          }}
        >
          <Form
            onClose={() => {
              setShowForm(false);
            }}
          />
        </div>
      )}
      <nav className="navbar navbar-expand-sm navbar-dark">
        <div
          className="container"
          style={{ justifyContent: "space-between", flexDirection: "row" }}
        >
          <div style={{ width: "200px" }}></div>
          <button
            className="btn-primary btn-lg"
            style={{
              position: "absolute",
              top: "10px",
              right: "20px",
              width: "fit-content",
            }}
            disabled={false}
            onClick={curAcount ? logoutOfWeb3Modal : loadWeb3Modal}
          >
            <i
              className="fas fa-wallet"
              style={{ marginRight: "12px", color: "white" }}
            ></i>
            {curAcount ? `Disconnect` : `Connect`}
          </button>
        </div>
      </nav>
      <br />
      <div className="center-body">
        <h1 className="btn-description">{btnData.description}</h1>
        <br />
        {curAcount && <h2 className="roof">{`Your Address: ${curAcount}`}</h2>}
        <br />
        <div className="roof">
          {curAcount && (
            <div>
              <button
                className="btn-primary btn-lg"
                style={{ width: "fit-content" }}
                disabled={false}
                onClick={onClaim}
              >
                {btnData.title}
              </button>
            </div>
          )}
        </div>
        <br />
        {cond && (
          <div>
            <h2 className="msg">{displayMessage[0]}</h2>
            <h2 className="msg-description">{displayMessage[1]}</h2>
          </div>
        )}

        <br />

        {cond && nftAmount.length > 0 ? (
          my_vouchers?.map((voucher, index) => {
            return (
              <h1 className="roof" key={index}>
                {voucher?.voucher}
              </h1>
            );
          })
        ) : (
          <span></span>
        )}
        <h2 className="rule-title">{ruleData.title}</h2>
        <br />
        <br />
        {ruleData.description.map((item, key) => {
          // if item type is function render as component
          if (typeof item === "function") {
            const Component = item;
            return (
              <div  key={key}>
                <h1 className="rule-description" key={key}>
                  {key === 0 ? <Component showForm={setShowForm} />:<Component/>}
                </h1>
                <br />
              </div>
            );
          } else {
            return (
              <div  key={key}>
                <h1 className="rule-description">
                  {item}
                </h1>
                <br />
              </div>
            );
          }
        })}
        <br />
        <br />
        <div className="footer">
          <h2 className="footer-text">{footer.title}</h2>
          <a className="footer-email" href="_">
            {footer.email}
          </a>
        </div>
      </div>
    </>
  );
};

export default Home;
