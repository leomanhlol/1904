import { getMetaMask, getCoinbaseWallet, getWalletConnect } from "./wallet.ts";
import { sttabi, sttaddr } from "./Stt";
import { ethers } from "ethers";
import { useState } from "react";
import $ from "jquery";
import classNames from "classnames";
import "./Home.css";
import "./Theme.css";
import Team from "./Team";
import axios from "axios";

function Home() {
  const [navButtonActive, setNavButtonActive] = useState(false);
  const [navBarActive, setNavBarActive] = useState(false);
  const [navMenuMobile, setNavMenuMobile] = useState(false);
  const [showBuyHistory, setShowBuyHistory] = useState(false);
  const [isGetedData, setIsGetedData] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [metaMask, metaMaskHooks] = getMetaMask();
  const [coinbaseWallet, coinbaseWalletHooks] = getCoinbaseWallet();
  const [walletConnect, walletConnectHooks] = getWalletConnect();
  let provider;
  let signer;
  let address;
  const connectWallet = async (walletType) => {
    if (address !== undefined) {
      alert("Already connected, your wallet address is " + address);
      return;
    }
    switch (walletType) {
      case "metamask":
        await metaMask.activate();
        provider = new ethers.providers.Web3Provider(metaMask.provider);
        signer = provider.getSigner();
        address = await signer.getAddress();
        alert("MetaMask activated, your wallet address is: " + address);
        break;
      case "binance":
        alert("Binance Wallet is currently under maintenance");
        break;
      case "coinbase":
        alert("Coinbase Wallet is currently under maintenance");
        // await coinbaseWallet.activate();
        // provider = new ethers.providers.Web3Provider(coinbaseWallet.provider);
        // signer = provider.getSigner();
        // address = await signer.getAddress();
        // alert("Coinbase wallet activated, your wallet address is: " + address);
        break;
      case "walletconnect":
        await walletConnect.activate();
        provider = new ethers.providers.Web3Provider(walletConnect.provider);
        signer = provider.getSigner();
        address = await signer.getAddress();
        alert("WalletConnect activated, your wallet address is: " + address);
        break;
      default:
        break;
    }
    regUserWallet();
    await submitWalletToRefWallet();
  };
  const regUserWallet = () => {
    axios({
      method: "POST",
      url: "http://api.bnbkingdom.io/api/register_user/",
      // withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      mode: "cors",
      data: {
        wallet_address: address
      }
    })
      .then((res) => res.data)
      .then((data) => {
        console.log(data);
        console.log(data.message);
        alert(
          "This wallet is activated for the first time, welcome to BNB Kingdom"
        );
      })
      .catch((err) => {
        const data = err.response.data;
        if (data.error_type === "user_already_exists") {
          axios({
            method: "GET",
            url: "http://api.bnbkingdom.io/api/get_user/" + address,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            },
            mode: "cors"
          })
            .then((res) => res.data)
            .then((data) => {
              console.log(data);
              if (data.user.wallet_address !== address) {
                alert("Internal server error!");
                window.location.reload();
                return;
              }
              alert(
                "This wallet already activated, welcome back to BNB Kingdom"
              );
            });
        }
      });
  };
  const preBuyCoin = (amount) => {
    if (amount < 0.1) return false;
    if (amount > 10) return false;
    if (amount === null) return false;
    if (amount === undefined) return false;
    if (amount === "") return false;
    return true;
  };
  const buyCoin = async () => {
    const amount = document.getElementById("buyinput");
    let status = await preBuyCoin(Number(amount.value));
    if (!status) {
      alert("Please enter a valid amount");
      amount.value = "0.1";
      return;
    }
    try {
      signer
        .sendTransaction({
          from: address,
          to: sttaddr,
          value: ethers.utils.parseEther(amount.value),
          nonce: provider.getTransactionCount(address, "latest"),
          gasLimit: "0x09184e72a000",
          gasPrice: "0x2710"
        })
        .then((transaction) => {
          console.log(transaction);
          alert("Transaction sent");
        })
        .then(() => {
          axios({
            method: "POST",
            url: "http://api.bnbkingdom.io/api/save_buy_history/",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            },
            mode: "cors",
            data: {
              wallet_address: address
            }
          })
            .then((res) => res.data)
            .then((data) => {
              console.log(data);
            });
        });
    } catch (error) {
      console.log(error);
      alert("Transaction failed, might be you are not connected to a wallet");
    }
  };
  const addTokenToWallet = async () => {
    try {
      provider.send("wallet_watchAsset", {
        type: "ERC20",
        options: {
          address: sttaddr,
          symbol: "BNBK",
          decimals: 18,
          image:
            "https://scontent.fsgn4-1.fna.fbcdn.net/v/t1.6435-9/60340728_4250971574952485_7380081354559455232_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=174925&_nc_ohc=zlZ8oy7d8_oAX9FD-gi&_nc_ht=scontent.fsgn4-1.fna&oh=00_AT9zjgIbjCISkIKpQVkkaF2lYkhlDxdX6qzf2bZDw62_WA&oe=62CCABB3"
        },
        id: Math.round(Math.random() * 100000)
      });
    } catch (error) {
      console.log(error);
      alert("Transaction failed, might be you are not connected to a wallet");
    }
  };
  const getReferralAddress = async () => {
    const currentUrl = window.location.search;
    const url = new URLSearchParams(currentUrl);
    const address = url.get("ref");
    return address;
  };
  const getReferralLink = async () => {
    if (address === undefined || address === null || address === "") {
      alert("Please connect to a wallet");
      return;
    }
    const newUrl = "https://bnbkingdom.io/?ref=" + address;
    document.getElementById("refaddress").value = newUrl;
    navigator.clipboard.writeText(newUrl);
  };
  const submitWalletToRefWallet = async () => {
    const currentRefAddress = await getReferralAddress();
    if (
      currentRefAddress !== address &&
      currentRefAddress !== null &&
      currentRefAddress !== "" &&
      currentRefAddress !== undefined
    ) {
      console.log(currentRefAddress);
    }
  };

  const toggleMenu = async () => {
    // document.getElementById("nav-button").classList.toggle("active");
    await setNavButtonActive(!navButtonActive);
    await setNavBarActive(!navBarActive);
  };
  const navButtonClass = () => {
    return classNames({
      "navbar-toggle": true,
      "navbar-active": navButtonActive
    });
  };
  const navBarClass = () => {
    return classNames({
      "header-navbar": true,
      "header-navbar-s1": true,
      "menu-mobile": navMenuMobile,
      "menu-shown": navBarActive
    });
  };
  window.addEventListener("resize", () => {
    if (window.innerWidth < 992) {
      setNavMenuMobile(true);
    }
  });

  const checkHistory = () => {
    if (address === undefined) {
      alert("Please connect to your wallet");
      return;
    }
    axios({
      method: "GET",
      url: "http://api.bnbkingdom.io/api/get_buy_history/" + address,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      mode: "cors"
    })
      .then((res) => res.data)
      .then((data) => {
        setHistoryData(data.history);
        setIsGetedData(true);
        console.log(data.history);
      });
    setShowBuyHistory(true);
  };
  return (
    <div className="nk-body body-wider theme-dark mode-onepage no-touch nk-nio-theme page-loaded chrome as-mobile overlay-menu-shown">
      <div className="nk-wrap">
        <header
          className="nk-header page-header is-transparent is-sticky is-shrink is-dark"
          id="header"
        >
          {/* Header @s */}

          <div className="header-main">
            <div className="header-container container">
              <div className="header-wrap">
                {/* Logo @s */}
                <div
                  className="header-logo logo animated"
                  data-animate="fadeInDown"
                  data-delay=".65"
                >
                  <a href="./" className="logo-link">
                    <img
                      className="logo-dark"
                      src="images/logofull.png"
                      srcSet="images/logofull.png 2x"
                      alt="logo"
                    />
                    <img
                      className="logo-light"
                      src="images/logofull.png"
                      srcSet="images/logofull.png 2x"
                      alt="logo"
                    />
                  </a>
                </div>
                {/* Menu Toogle @s */}
                <div className="header-nav-toggle">
                  <div
                    id="nav-button"
                    className={navButtonClass()}
                    data-menu-toggle="header-menu"
                    onClick={() => toggleMenu()}
                  >
                    <div className="toggle-line">
                      <span></span>
                    </div>
                  </div>
                </div>
                <div className={navBarClass()} id="nav-bar">
                  <nav className="header-menu" id="header-menu">
                    <ul
                      className="menu animated remove-animation"
                      data-animate="fadeInDown"
                      data-delay=".75"
                    >
                      <li className="menu-item">
                        <a className="" href="#about">
                          About
                        </a>
                      </li>

                      <li className="menu-item">
                        <a
                          className="menu-link nav-link"
                          href="https://docs.bnbkingdom.io/"
                        >
                          WhitePaper
                        </a>
                      </li>
                      <li className="menu-item">
                        <a
                          className="menu-link nav-link"
                          href="https://docs.bnbkingdom.io/tokenomics"
                        >
                          Tokenomic
                        </a>
                      </li>
                      <li className="menu-item">
                        <a className="" href="#roadmap">
                          Roadmap
                        </a>
                      </li>
                      <li className="menu-item">
                        <a
                          className="menu-link nav-link"
                          href="https://testnet.bscscan.com/address/0x82d88F3cdBeD18aA3CbCa0170569aCD3c648ed2e"
                        >
                          Contract
                        </a>
                      </li>
                      <li className="menu-item">
                        <a className="" href="#team">
                          Team
                        </a>
                      </li>
                      <li className="menu-item">
                        <a className="" href="#partner">
                          Partner
                        </a>
                      </li>
                    </ul>
                    <ul
                      className="menu-btns menu-btns-s2 align-items-center animated remove-animation"
                      data-animate="fadeInDown"
                      data-delay=".85"
                    >
                      {/* <li className="language-switcher language-switcher-s4 toggle-wrap">
                          <a className="toggle-tigger" href="#">English</a>
                          <ul className="toggle-class toggle-drop toggle-drop-left drop-list drop-list-sm">
                            <li><a href="#">French</a></li>
                            <li><a href="#">Chinese</a></li>
                            <li><a href="#">Hindi</a></li>
                          </ul>
                        </li> */}
                      {/* <li>
                        <a
                          href="https://poocoin.app/tokens/0x82d88F3cdBeD18aA3CbCa0170569aCD3c648ed2e"
                          className="btn btn-md btn-grad btn-grad-alt no-change"
                        >
                          <span>View Chart</span>
                        </a>
                      </li> */}
                      <li>
                        <button
                          className="addToWallet btn btn-md btn-grad btn-grad-alt no-change"
                          data-toggle="modal"
                          data-target="#connectWalletPopup"
                        >
                          CONNECT WALLET
                        </button>
                      </li>
                    </ul>
                  </nav>
                  <div
                    className="header-navbar-overlay"
                    onClick={() => toggleMenu()}
                  ></div>
                </div>
                {/* .header-navbar @e */}
              </div>
            </div>
          </div>
          {/* .header-main @e */}
          {/* Connect-Wallet-Popup */}
          <div
            className="modal fade"
            id="connectWalletPopup"
            tabIndex={-1}
            aria-labelledby="connectWalletPopupLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4
                    className="modal-title color-white"
                    id="connectWalletPopupLabel"
                  >
                    Connect Wallet
                  </h4>
                  <button
                    type="button"
                    className="close color-white close-button"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
                <div className="modal-body transparent-bg">
                  <div
                    className="wallet-content"
                    onClick={() => connectWallet("metamask")}
                  >
                    <div className="wallet-body">
                      <img
                        className="wallet-logo"
                        src="assets/images/Metamask-icon.svg"
                        alt="Metamask"
                        width={50}
                        height={50}
                      />
                      <h3 className="display-inline wallet-name">Metamask</h3>
                    </div>
                  </div>
                  <div
                    className="wallet-content"
                    onClick={() => connectWallet("binance")}
                  >
                    <div className="wallet-body">
                      <img
                        className="wallet-logo"
                        src="assets/images/Binance-Smart-Chain-Logo.svg"
                        alt="WalletConnect"
                        width={50}
                        height={50}
                      />
                      <h3 className="display-inline wallet-name">
                        Binance Chain
                      </h3>
                    </div>
                  </div>
                  <div
                    className="wallet-content"
                    onClick={() => connectWallet("coinbase")}
                  >
                    <div className="wallet-body">
                      <img
                        className="wallet-logo"
                        src="assets/images/coinbase-logo.png"
                        alt="WalletConnect"
                        width={50}
                        height={50}
                      />
                      <h3 className="display-inline wallet-name">
                        Coinbase Wallet
                      </h3>
                    </div>
                  </div>
                  <div
                    className="wallet-content"
                    onClick={() => connectWallet("walletconnect")}
                  >
                    <div className="wallet-body">
                      <img
                        className="wallet-logo"
                        src="assets/images/WalletConnect-icon.svg"
                        alt="WalletConnect"
                        width={50}
                        height={50}
                      />
                      <h3 className="display-inline wallet-name">
                        Walletconnect
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banner @s */}
          <div className="header-banner bg-theme-grad-s2 header-banner-lungwort ov-h tc-light">
            <div className="background-shape bs-right" />
            <div className="nk-banner">
              <div className="banner banner-fs banner-s2">
                <div className="banner-wrap">
                  <div className="container">
                    <div className="row align-items-center justify-content-center">
                      <div className="col-xl-6 col-lg-5 order-lg-last">
                        <div
                          className="banner-gfx banner-gfx-re-s2 animated"
                          data-animate="fadeInUp"
                          data-delay="1.25"
                        >
                          <img src="images/head1.png" alt="header" />
                        </div>
                      </div>
                      {/* .col */}
                      <div className="col-xl-6 col-lg-7 text-center text-lg-left">
                        <div className="banner-caption cpn tc-light">
                          <div className="cpn-head">
                            <h1
                              className="title title-xl-2 fw-6 animated"
                              data-animate="fadeInUp"
                              data-delay="1.35"
                            >
                              WELCOME TO BNB KINGDOM
                            </h1>
                          </div>
                          <div className="cpn-text">
                            <p
                              className="lead animated"
                              data-animate="fadeInUp"
                              data-delay="1.45"
                            >
                              The most unprejudiced program to earn token{" "}
                              <br className="d-none d-md-block" />
                              on the Binance Smart Chain
                            </p>
                          </div>
                          <div className="cpn-action">
                            <ul
                              className="cpn-links animated"
                              data-animate="fadeInUp"
                              data-delay="1.55"
                            >
                              <li>
                                <a
                                  className="link link-primary"
                                  href="https://docs.bnbkingdom.io/"
                                >
                                  <em className="link-icon icon-circle ti ti-files" />
                                  <span>White Paper</span>
                                </a>
                              </li>
                              <li>
                                <a
                                  className="link link-primary video-play"
                                  href="https://testnet.bscscan.com/address/0x82d88F3cdBeD18aA3CbCa0170569aCD3c648ed2e"
                                >
                                  <em className="link-icon icon-circle ti ti-control-play" />
                                  <span>View Contract</span>
                                </a>
                              </li>
                            </ul>
                          </div>
                          <div
                            className="token-status token-status-s2 animated"
                            data-animate="fadeInUp"
                            data-delay="1.65"
                          >
                            <div className="token-action token-action-s1">
                              <a className="btn btn-md btn-grad" href="#token">
                                BUY AND INVEST WITH US
                              </a>
                            </div>
                            <ul className="icon-list">
                              <li>
                                {" "}
                                <div className="circle">
                                  <a href="https://t.me/+KcAJFWXWUDY1NGY1">
                                    <em className="new-social-icon fab fa-telegram" />
                                  </a>
                                </div>
                              </li>
                              <li>
                                <div className="circle">
                                  <a href="https://t.me/bnbkingdomchannel">
                                    <em className="new-social-icon fab fa-telegram" />
                                  </a>
                                </div>
                              </li>
                              <li>
                                <div className="circle">
                                  <a href="https://twitter.com/bnbkingdom2022?t=DPqVpL7cr1X8Ku6iSOqu2g&s=09">
                                    <em className="new-social-icon fab fa-twitter" />
                                  </a>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      {/* .col */}
                    </div>
                    {/* .row */}
                  </div>
                </div>
              </div>
            </div>
            {/* .nk-banner */}
            {/* Place Particle Js */}
            <div
              id="particles-bg"
              className="particles-container particles-bg"
              data-pt-base="#00c0fa"
              data-pt-base-op=".3"
              data-pt-line="#2b56f5"
              data-pt-line-op=".5"
              data-pt-shape="#00c0fa"
              data-pt-shape-op=".2"
            />
          </div>
          {/* .header-banner @e */}
        </header>
        <main className="nk-pages"></main>
      </div>
      {/* // */}
      <section className="section bg-theme tc-light" id="about">
        <div className="container">
          {/* Block @s */}
          <div className="nk-block nk-block-features-s2">
            <div className="row align-items-center gutter-vr-30px">
              <div className="col-md-6">
                <div
                  className="gfx animated"
                  data-animate="fadeInUp"
                  data-delay=".1"
                >
                  <img src="images/dev1.png" alt="dev1" />
                </div>
              </div>
              {/* .col */}
              <div className="col-md-6">
                {/* Section Head @s */}
                <div className="nk-block-text">
                  <h6
                    className="title title-xs title-s1 tc-primary animated"
                    data-animate="fadeInUp"
                    data-delay=".2"
                  >
                    What is BNB KINGDOM
                  </h6>
                  <h2
                    className="title title-semibold animated"
                    data-animate="fadeInUp"
                    data-delay=".3"
                  >
                    We’ve built a platform <br />
                    to invest and earn shares.
                  </h2>
                  <p
                    className="lead animated"
                    data-animate="fadeInUp"
                    data-delay=".4"
                  >
                    BNB KINGDOM have watched all the coins activities for the
                    past frame of time and it learned from their mistakes
                    realizing all coins have strong community’s but no real
                    project was introduced to the community we aim to change
                    this by
                  </p>
                  {/*
                            <p class="animated" data-animate="fadeInUp" data-delay=".5"> launching all kind of project
                                to our community and we will start with an NFT collection that will be exclusive for our
                                investors and right next after that we be creating a invest2earn to maximize</p>
                            <p class="animated" data-animate="fadeInUp" data-delay=".6"> all the innovation points along
                                that we will be introducing big competition and giveaways inside the community</p> */}
                </div>
              </div>
              {/* .col */}
            </div>
            {/* .row */}
          </div>
          {/* .block @e */}
        </div>
      </section>
      {/* // */}
      <section className="section bg-theme-alt tc-light">
        <div className="container">
          {/* Block @s */}
          <div className="nk-block nk-block-features-s2">
            <div className="row align-items-center flex-row-reverse gutter-vr-30px">
              <div className="col-md-6">
                <div
                  className="gfx animated"
                  data-animate="fadeInUp"
                  data-delay=".1"
                >
                  <img src="images/dev2.png" alt="dev2" />
                </div>
              </div>
              {/* .col */}
              <div className="col-md-6">
                {/* Section Head @s */}
                <div className="nk-block-text">
                  <h6
                    className="title title-xs title-s1 tc-primary animated"
                    data-animate="fadeInUp"
                    data-delay=".2"
                  >
                    Everyone loves profits
                  </h6>
                  <h2
                    className="title title-semibold animated"
                    data-animate="fadeInUp"
                    data-delay=".3"
                  >
                    Introduction
                  </h2>
                  <p
                    className="animated"
                    data-animate="fadeInUp"
                    data-delay=".4"
                  >
                    BNB KINGDOM - we have solid assets including shares and
                    casino chains, bars, hotels, restaurants, resorts,tourist
                    resorts,....all over the world such as Venetian Macao –
                    China, Grand Lisboa – Macau, China, Foxwoods Resort Casino –
                    Connecticut - USA, MGM Grand Casiono – Las Vegas, Bellagio –
                    Las Vegas, Casino de Monte Carlo – Monaco,.... We choose
                    casinos, bars, restaurants, hotels, resorts, tourism areas
                    with good growth and with regular cash flow.
                  </p>
                  <p
                    className="animated"
                    data-animate="fadeInUp"
                    data-delay=".5"
                  >
                    For many years of experience in the financial industry, we
                    are developing a non - concentrated financial ecosystem,
                    including a professional investment system, the auction
                    exchange, NFT collections &amp; NFT market place and
                    cryptocurrency exchange.
                  </p>
                  {/*<p class="animated" data-animate="fadeInUp" data-delay=".6">Second: HOLDR rewards provide
                                you with an automatically ever-increasing balance.</p>
                            <p class="animated" data-animate="fadeInUp" data-delay=".7">Third: automatic balance
                                increasing; second, burning increases the value of each token.</p>
                            <p class="animated" data-animate="fadeInUp" data-delay=".8">You can see your balance and the
                                price of each token increase simultaneously and automatically with BNBKINGDOM</p>
                            </p> */}
                </div>
              </div>
              {/* .col */}
            </div>
            {/* .row */}
          </div>
          {/* .block @e */}
          {/* Block @s */}
          <div className="nk-block nk-block-features-s2">
            <div className="row align-items-center gutter-vr-30px">
              <div className="col-md-6">
                <div
                  className="gfx animated"
                  data-animate="fadeInUp"
                  data-delay=".1"
                >
                  <img src="images/dev3.png" alt="dev3" />
                </div>
              </div>
              {/* .col */}
              <div className="col-md-6">
                {/* Section Head @s */}
                <div className="nk-block-text">
                  <h6
                    className="title title-xs title-s1 tc-primary animated"
                    data-animate="fadeInUp"
                    data-delay=".2"
                  >
                    DEFLATIONARY MECHANISM
                  </h6>
                  <h2
                    className="title title-semibold animated"
                    data-animate="fadeInUp"
                    data-delay=".3"
                  >
                    Our Vision
                  </h2>
                  <p
                    className="animated"
                    data-animate="fadeInUp"
                    data-delay=".4"
                  >
                    Traditional trading systems and traditional investment
                    systems do not work efficiently so that we create a
                    decentralized financial ecosystem. BNB KINGDOM is where
                    investors can make sure to deposits and receive cash flow by
                    20% per day.
                  </p>
                  <p
                    className="animated"
                    data-animate="fadeInUp"
                    data-delay=".5"
                  >
                    After the negative influence of the Covid-19, the bank is
                    liquidating the enterprise's mortgage assets at cheap
                    prices. We call for a large amount of capital to collect all
                    of these assets. This property includes cars, real estate,
                    enterprise shares, corporate bonds,...We can resell these
                    assets to gain profits over 200%. .
                  </p>
                  <p
                    className="animated"
                    data-animate="fadeInUp"
                    data-delay=".5"
                  >
                    Along with that, we develope the BNBK token which is used in
                    BNB KINGDOM’s ecosystem. BNBK can be used to deal with the
                    assets that we' ve acquired from banks and contributed
                    equity investments to the casino business systems,
                    restaurants, hotels that we own, as well as to pay for
                    transaction fees in BNB KINGDOM .
                  </p>
                </div>
              </div>
              {/* .col */}
            </div>
            {/* .row */}
          </div>
          {/* .block @e */}
          {/* Block @s */}
          <div className="nk-block nk-block-features-s2">
            <div className="row align-items-center flex-row-reverse gutter-vr-30px">
              <div className="col-md-6">
                <div
                  className="gfx animated"
                  data-animate="fadeInUp"
                  data-delay=".1"
                >
                  <img src="images/dev4.png" alt="Dev4" />
                </div>
              </div>
              {/* .col */}
              <div className="col-md-6">
                {/* Section Head @s */}
                <div className="nk-block-text">
                  <h6
                    className="title title-xs title-s1 tc-primary animated"
                    data-animate="fadeInUp"
                    data-delay=".2"
                  >
                    HOLD &amp; WIN
                  </h6>
                  <h2
                    className="title title-semibold animated"
                    data-animate="fadeInUp"
                    data-delay=".3"
                  >
                    EVERYONE WIN
                  </h2>
                  <p
                    className="animated"
                    data-animate="fadeInUp"
                    data-delay=".4"
                  >
                    {" "}
                    $BNBKINGDOM is a reflect token. That means you will earn
                    some $BNBKINGDOM on each transaction just by holding yours.
                    In fact, there is a 10% tax on each transaction that is
                    redistributed between ALL $BNBKINGDOM holders instantly and
                    gaslessly. Holders earn passive rewards through static
                    reflection as they watch their balance of $BNBKINGDOM grow
                    continuously.{" "}
                  </p>
                </div>
              </div>
              {/* .col */}
            </div>
            {/* .row */}
          </div>
          {/* .block @e */}
        </div>
      </section>
      {/* // */}
      <section className="section bg-theme-dark-alt tc-light" id="why">
        <div className="background-shape bs-reverse" />
        <div className="container">
          <div className="section-head section-head-s9 wide-sm">
            <h6
              className="title title-xs title-s1 tc-primary animated"
              data-animate="fadeInUp"
              data-delay=".1"
            >
              How to buy BNBKINGDOM
            </h6>
            <h2
              className="title title-semibold animated"
              data-animate="fadeInUp"
              data-delay=".2"
            >
              Best Features
            </h2>
            <p className="animated" data-animate="fadeInUp" data-delay=".3">
              Open your Google Chrome browser and visit metamask.org. Download
              the MetaMask chrome extension, set up your wallet and configure
              the Binance network on it (more details here).
            </p>
          </div>
          {/* Block @s */}
          <div className="nk-block">
            <div className="row gutter-vr-30px justify-content-center">
              <div className="col-lg-4 col-md-4">
                <div
                  className="feature feature-s8 feature-center card card-full card-md bg-theme-alt animated"
                  data-animate="fadeInUp"
                  data-delay=".4"
                >
                  <div className="feature-icon feature-icon-lg my-0">
                    <img src="images/binance-logo-5.png" alt="feature" />
                  </div>
                  <div className="feature-text feature-text-s8">
                    <h4 className="title title-sm title-thin title-s5">
                      <span>Get some</span>Smart Chain BNB
                    </h4>
                    <p>
                      As you need some Smart Chain BNB to trade on BEP-20 based
                      DEX, here you will need to buy some Smart Chain BNB on an
                      exchange (CEX) like Binance or Huobi.
                    </p>
                    <a href="#" className="link link-primary link-feature-s1">
                      <em className="link-icon icon-circle icon-circle-md ti ti-arrow-right" />
                    </a>
                  </div>
                </div>
              </div>
              {/* .col */}
              <div className="col-lg-4 col-md-4">
                <div
                  className="feature feature-s8 feature-center card card-full card-md bg-theme-alt animated"
                  data-animate="fadeInUp"
                  data-delay=".5"
                >
                  <div className="feature-icon feature-icon-lg my-0">
                    <img src="images/MetaMask_Fox.svg.png" alt="feature" />
                  </div>
                  <div className="feature-text feature-text-s8">
                    <h4 className="title title-sm title-thin title-s5">
                      <span>Set your MetaMask wallet</span>
                    </h4>
                    <p>
                      Create your MetaMask wallet then withdraw your Smart Chain
                      BNB from the exchange to your wallet address.
                    </p>
                    <a href="#" className="link link-primary link-feature-s1">
                      <em className="link-icon icon-circle icon-circle-md ti ti-arrow-right" />
                    </a>
                  </div>
                </div>
              </div>
              {/* .col */}
              <div className="col-lg-4 col-md-4">
                <div
                  className="feature feature-s8 feature-center card card-full card-md bg-theme-alt animated"
                  data-animate="fadeInUp"
                  data-delay=".6"
                >
                  <div className="feature-icon feature-icon-lg my-0">
                    <img src="images/icon.png" alt="feature" />
                  </div>
                  <div className="feature-text feature-text-s8">
                    <h4 className="title title-sm title-thin title-s5">
                      <span>Buy $BNBKINGDOM</span>
                    </h4>
                    <p>
                      Go to the PancakeSwap DEX and you can now swap $BNB to
                      $BNBKINGDOM easily. Make sure to set slippage to 10 - 12%
                      on Pancakeswap for the 10% reflection fee.
                    </p>
                    <a href="#" className="link link-primary link-feature-s1">
                      <em className="link-icon icon-circle icon-circle-md ti ti-arrow-right" />
                    </a>
                  </div>
                </div>
              </div>
              {/* .col */}
            </div>
            {/* .row */}
            <div className="d-flex justify-content-center pdt-r">
              <ul
                className="btn-grp animated"
                data-animate="fadeInUp"
                data-delay=".7"
              >
                <li>
                  <a href="https://metamask.io" className="btn btn-md btn-grad">
                    Get a Wallet
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.bnbkingdom.io/"
                    className="btn btn-md btn-outline btn-grad on-bg-theme-dark-alt"
                  >
                    Download Whitepaper
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* .block @e */}
        </div>
      </section>
      {/* // */}
      <section className="section bg-theme-alt tc-light" id="benifits">
        <div className="container">
          <div className="section-head section-head-s9 wide-sm">
            <h6
              className="title title-xs title-s1 tc-primary animated"
              data-animate="fadeInUp"
              data-delay=".1"
            >
              BNBKINGDOM Feature
            </h6>
            <h2
              className="title title-semibold animated"
              data-animate="fadeInUp"
              data-delay=".2"
            >
              Ecosystem key features
            </h2>
            <p className="animated" data-animate="fadeInUp" data-delay=".3">
              The BNBKINGDOM Team combines a passion for esports, industry
              experise &amp; proven record in finance, development, marketing.
            </p>
          </div>
          {/* Block @s */}
          <div className="nk-block nk-block-features">
            <div className="row gutter-100px gutter-vr-60px">
              <div className="col-lg-6">
                <div
                  className="feature feature-s12 animated"
                  data-animate="fadeInUp"
                  data-delay=".4"
                >
                  <div className="feature-icon feature-icon-lg m-lg-0">
                    <img
                      src="images/3-HOLDR-Rewards---Feature-Icon-with-circle.svg"
                      alt="feature"
                    />
                  </div>
                  <div className="feature-text feature-text-s2">
                    <h6>+ Automated Investment System: </h6>
                    <p>
                      {" "}
                      Allowing users to send BNB to receive interest rates up to
                      20%/day. We're going to use this money to buy low - cost
                      mortgage assets from big banks and resell them at higher
                      prices to pay for investors.
                    </p>
                  </div>
                </div>
              </div>
              {/* .col */}
              <div className="col-lg-6">
                <div
                  className="feature feature-s12 animated"
                  data-animate="fadeInUp"
                  data-delay=".5"
                >
                  <div className="feature-icon feature-icon-lg m-lg-0">
                    <img
                      src="images/3-Automatic-Liquidity---Feature-Icon-with-circle.svg"
                      alt="feature"
                    />
                  </div>
                  <div className="feature-text feature-text-s2">
                    <h6>+ BK Auction Platform: </h6>
                    <p>
                      {" "}
                      Allowing BNBK token to aution for assets, stocks, bonds,
                      and nft collections online and offline. Auctions are held
                      monthly, quarterly
                    </p>
                  </div>
                </div>
              </div>
              {/* .col */}
              <div className="col-lg-6">
                <div
                  className="feature feature-s12 animated"
                  data-animate="fadeInUp"
                  data-delay=".6"
                >
                  <div className="feature-icon feature-icon-lg m-lg-0">
                    <img
                      src="images/3-Burn---Feature-Icon-with-circle.svg"
                      alt="feature"
                    />
                  </div>
                  <div className="feature-text feature-text-s2">
                    <h6>+ NFT &amp; NFT market place: </h6>
                    <p>
                      It is easy to buy, to collect, to store and to move NFTs.
                      These NFT we launch, can be used as a certificate for
                      investor' s contracts.{" "}
                    </p>
                    <p>
                      launch the collection of NFT which has rewards and APY for
                      NFT holders
                    </p>
                    <p />
                  </div>
                </div>
              </div>
              {/* .col */}
              <div className="col-lg-6">
                <div
                  className="feature feature-s12 animated"
                  data-animate="fadeInUp"
                  data-delay=".7"
                >
                  <div className="feature-icon feature-icon-lg m-lg-0">
                    <img
                      src="images/3-Marketing-Feature-Icon-with-circle.svg"
                      alt="feature"
                    />
                  </div>
                  <div className="feature-text feature-text-s2">
                    <h6>+ BK Exchange: </h6>
                    <p>
                      {" "}
                      It is easy to trade, to buy, to sell, to send and to
                      receive BNBK tokens and other digital tokens
                    </p>
                  </div>
                </div>
              </div>
              {/* .col */}
            </div>
            {/* .row */}
          </div>
          {/* .block @s */}
        </div>
      </section>
      {/* // */}
      <section className="section bg-theme-alt tc-light" id="token">
        <div className="container">
          <div className="section-head section-head-s9 wide-md">
            <h6
              className="title title-xs title-s1 tc-primary animated"
              data-animate="fadeInUp"
              data-delay=".1"
            >
              Token
            </h6>
            <h2
              className="title title-semibold animated"
              data-animate="fadeInUp"
              data-delay=".2"
            >
              Token Sale
            </h2>
            <div className="wide-sm">
              <p className="animated" data-animate="fadeInUp" data-delay=".3">
                Token address: 0x82d88F3cdBeD18aA3CbCa0170569aCD3c648ed2e
              </p>{" "}
              <p
                classname="animated btn"
                data-animate="fadeInUp"
                data-delay=".4"
              >
                PLEASE CONNECT YOUR WALLET TO JOIN OUR PROGRAMS{" "}
              </p>
              <button
                className="addToWallet btn btn-md btn-grad no-change"
                data-toggle="modal"
                data-target="#connectWalletPopup"
              >
                CONNECT WALLET
              </button>
            </div>
          </div>
          {/* Block @s */}
          <div className="nk-block nk-block-token">
            <div className="row gutter-vr-30px">
              <div className="col-lg-11">
                <div className="row">
                  <div className="col-sm-3">
                    <div
                      className="token-stage text-center bg-theme-dark-alt animated"
                      data-animate="fadeInUp"
                      data-delay=".4"
                    >
                      <div className="token-stage-title token-stage-one">
                        Program 1
                      </div>
                      <div className="token-stage-date">
                        <h6>Validity: 90 days</h6>
                        <span> 2%/day </span>
                        <div>
                          <span>(0.8% BNB and 1.2% BNBK)</span>
                        </div>
                        <div className="col-sm-3" />
                      </div>
                      <div className="token-stage-info">
                        <span className="token-stage-bonus">
                          Direct commission:{" "}
                        </span>
                        <div>
                          <span className="token-stage-bonus">
                            {" "}
                            20% BNB and 50% BNBK{" "}
                          </span>
                        </div>
                        <span className="token-stage-cap">
                          Volume investment:{" "}
                        </span>
                        <div>
                          <span className="token-stage-cap">
                            0.1 BNB – 1 BNB
                          </span>
                        </div>
                      </div>
                      {/* <div className="token-stage-info">
                          <div className="input-group has-success mb-3">
                            <span className="input-group-text">Enter BNB Orders</span>
                            <input id="buyinput" type="text" placeholder="0.01" defaultValue="0.01" required="required" className="input-bordered-presale" onfocus="focused(this)" onfocusout="defocused(this)" />
                            <a id="airbtn" href="javascript:void(0)" onclick="buystt()" className="btn btn-info mb-0" style={{marginLeft: '5px', marginRight: '5px'}}>JOIN OUR PROGRAM</a>
                          </div>
                        </div> */}
                    </div>
                  </div>
                  {/* .col */}
                  <div className="col-sm-3">
                    <div
                      className="token-stage text-center bg-theme-dark-alt animated"
                      data-animate="fadeInUp"
                      data-delay=".4"
                    >
                      <div className="token-stage-title token-stage-one">
                        Program 2
                      </div>
                      <div className="token-stage-date">
                        <h6>Validity: 90 days</h6>
                        <span>3%/day</span>
                        <div>
                          <span>(0.9% BNB and 2.1% BNBK)</span>
                        </div>
                        <div className="col-sm-4" />
                      </div>
                      <div className="token-stage-info">
                        <span className="token-stage-bonus">
                          Direct commission:{" "}
                        </span>
                        <div>
                          <span className="token-stage-bonus">
                            20% BNB and 50% BNBK
                          </span>
                        </div>
                        <span className="token-stage-cap">
                          Volume investment:
                        </span>
                        <div>
                          <span className="token-stage-cap">
                            ≥1 BNB – 3 BNB
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* .col */}
                  <div className="col-sm-3">
                    <div
                      className="token-stage text-center bg-theme-dark-alt animated"
                      data-animate="fadeInUp"
                      data-delay=".4"
                    >
                      <div className="token-stage-title token-stage-one">
                        Program 3
                      </div>
                      <div className="token-stage-date">
                        <h6>Validity: 90 days</h6>
                        <span>5%/day </span>
                        <div>
                          <span>1.1% BNB and 3.9% BNBK</span>
                        </div>
                        <div className="col-sm-4" />
                      </div>
                      <div className="token-stage-info">
                        <span className="token-stage-bonus">
                          Direct commission:
                        </span>
                        <div>
                          <span className="token-stage-bonus">
                            25% BNB and 50% BNBK
                          </span>
                        </div>
                        <span className="token-stage-cap">
                          Volume investment:{" "}
                        </span>
                        <div>
                          <span className="toke-stage-cap">
                            ≥3 BNB – 10 BNB
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <div
                      className="token-stage text-center bg-theme-dark-alt animated"
                      data-animate="fadeInUp"
                      data-delay=".4"
                    >
                      <div className="token-stage-title token-stage-one">
                        Program 4
                      </div>
                      <div className="token-stage-date">
                        <h6>Validity: 90 days</h6>
                        <span>6%/day </span>
                        <div>
                          <span>1.5% BNB and 4.5% BNBK</span>
                        </div>
                        <div className="col-sm-4" />
                      </div>
                      <div className="token-stage-info">
                        <span className="token-stage-bonus">
                          Direct commission:
                        </span>
                        <div>
                          <span className="token-stage-bonus">
                            25% BNB and 50% BNBK
                          </span>
                        </div>
                        <span className="token-stage-cap">
                          Volume investment:{" "}
                        </span>
                        <div>
                          <span className="toke-stage-cap">≥10 BNB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* .col */}
                  {/* .col */}
                </div>

                {/* row */}
                {/* <div className="token-action-box text-center bg-theme animated" data-animate="fadeInUp" data-delay=".7">
                    <div className="token-action-title bg-theme-dark-alt">Join Our <br /> Pre-Sale List</div>
                    <div className="token-action-date"><strong>Pre-Sale Start at</strong> 03 April 2022</div>
                    <div className="token-action-btn">
                      <a href="#" className="btn btn-lg btn-grad">Join Our Community</a>
                    </div>
                  </div> */}
              </div>

              <div className="col-lg-7 col-md-6 mb-lg-0 mb-4">
                <div className="card bg-gradient-dark">
                  <div className="card-body p-3">
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="d-flex flex-column h-100">
                          <h2
                            className="col-lg 5 font-weight-bolder mb-4"
                            style={{ color: "black" }}
                          >
                            BUY AND INVEST WITH US
                          </h2>
                          <div className="input-group has-success mb-3">
                            <span className="input-group-text">
                              Enter BNB Orders
                            </span>
                            <input
                              id="buyinput"
                              type="text"
                              placeholder="0.1"
                              defaultValue="0.1"
                              required="required"
                              className="input-bordered-presale"
                              onfocus="focused(this)"
                              onfocusout="defocused(this)"
                            />
                          </div>

                          <div className="view-buy other_btn">
                            <center>
                              <a
                                id="airbtn"
                                href="javascript:void(0)"
                                className="btn btn-info btn-auto btn-md"
                                onClick={() => buyCoin()}
                              >
                                BUY AND INVEST
                              </a>
                              <a
                                href="javascript:void(0)"
                                id="airbtn"
                                className="btn btn-info btn-auto btn-md"
                                onClick={() => addTokenToWallet()}
                              >
                                Add Token to Wallet
                              </a>
                              <input
                                style={{ display: "none" }}
                                id="buyainput"
                                type="text"
                                className="input-bordered"
                                required="required"
                                placeholder="0.001"
                                defaultValue="0.001"
                              />
                              <br />
                              <p className="card__description">
                                {" "}
                                (Please Connect to Binance Smart Chain first.)
                              </p>

                              <input
                                style={{
                                  display: "none",
                                  width: "100%",
                                  color: "beige",
                                  marginTop: "10px",
                                  marginBottom: "10px",
                                  padding: "5px",
                                  textAlign: "center",
                                  backgroundImage:
                                    "linear-gradient(to left, #d565b0, #5b6de8, #ff937b, #ce62b6)"
                                }}
                                id="buyinputone"
                                type="text"
                                className="input_airdrop"
                                required="required"
                                placeholder="0.002"
                                defaultValue="0.002"
                              />
                              {/* <a href="javascript:void(0)" id="airbtn" onclick="buyair()" className="btn btn-md btn-auto btn-grad no-change">Claim 3,000,000
                                $BNBK</a> */}
                            </center>
                          </div>
                          {/* <div className="mt-6">
                            <p className="text-info">
                              (*) Fee Claim: 0.0002 BNB<br />
                              (*) Rate Sale: 0.01 BNB = 415.000 BNBK<br />
                              (*) Minium buy 0.01 BNB - 10 BNB<br />
                            </p>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-5 col-md-6">
                <div className="card bg-dark h-100 p-3">
                  <div className="row">
                    <div className="col-lg-12">
                      <h2 className="font-weight-bolder mb-4">
                        Referral Rewards
                      </h2>
                      <li
                        style={{ color: "black" }}
                        className="col-lg 5 font-weight-bolder mb-4"
                      >
                        Bonus for each AIRDROP AND PRE-SALE
                      </li>
                      <li
                        style={{ color: "black" }}
                        className="col-lg 5 font-weight-bolder mb-4"
                      >
                        Get 20% BNB and 50% $BNBK per referral
                      </li>
                      <div className="input-group mb-3">
                        <input
                          id="refaddress"
                          type="text"
                          className="form-control"
                          value={"Click to get your referral address link"}
                          onfocus="focused(this)"
                          onfocusout="defocused(this)"
                          readOnly="readOnly"
                        />
                      </div>
                      <div>
                        <center>
                          <a
                            href="javascript:void(0)"
                            className="btn btn-primary btn-auto btn-md"
                            onClick={() => getReferralLink()}
                          >
                            GET REFERRAL LINK
                          </a>
                        </center>
                        <input
                          id="airinput"
                          type="text"
                          className="form-control"
                          defaultValue
                          required="required"
                          placeholder="Referrer Id"
                          hidden
                          onfocus="focused(this)"
                          onfocusout="defocused(this)"
                        />
                      </div>
                      <div
                        id="refLinkContainer"
                        className="input-group mb-3"
                        style={{ display: "none" }}
                      >
                        <input
                          id="refLink"
                          type="text"
                          className="form-control"
                          disabled="disabled"
                          onfocus="focused(this)"
                          onfocusout="defocused(this)"
                        />
                        <a
                          href="javascript:copyToClipboard('refLink')"
                          className="btn btn-primary mb-0"
                        >
                          Copy
                        </a>
                      </div>
                      <div>
                        <p className="text-info">
                          <br />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* .col */}
            </div>
            {/* .row */}
          </div>
          {/* .block @e */}
          {/* Block @s */}
          <div className="row mt-4" id="buypresale">
            {/*Adrop*/}

            {/*Invite By*/}
            <div className="col-lg-5">
              <table
                className="table table-token table-token-s1 animated"
                data-animate="fadeInUp"
                data-delay=".8"
              >
                <tbody>
                  <tr>
                    <td className="table-head table-head-s1">Token Name</td>
                    <td className="table-des table-des-s1">BNB KINGDOM</td>
                  </tr>
                  <tr>
                    <td className="table-head table-head-s1">Token Symbol</td>
                    <td className="table-des table-des-s1">BNBK</td>
                  </tr>
                  <tr>
                    <td className="table-head table-head-s1">Decimals</td>
                    <td className="table-des table-des-s1">18</td>
                  </tr>
                  <tr>
                    <td className="table-head table-head-s1">Specifications</td>
                    <td className="table-des table-des-s1">BNBK token</td>
                  </tr>
                  <tr>
                    <td className="table-head table-head-s1">
                      Max circulating supply
                    </td>
                    <td className="table-des table-des-s1">1,000,000,000</td>
                  </tr>
                  <tr>
                    <td className="table-head table-head-s1">Network</td>
                    <td className="table-des table-des-s1">
                      Binance Smart Chain - BSC
                    </td>
                  </tr>
                  <tr>
                    <td className="table-head table-head-s1">Listing Time</td>
                    <td className="table-des table-des-s1">August 22, 2022</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              className="animated col-md-6"
              data-animate="fadeInUp"
              data-delay=".1"
            >
              <img
                className="tokenomic"
                src="images/tokenomic.png"
                alt="dev6"
              />
            </div>
          </div>
          {!showBuyHistory && (
            <div className="button-container">
              <button
                className="btn btn-s2 btn-md btn-grad btn-center"
                onClick={() => checkHistory()}
              >
                Buy History
              </button>
            </div>
          )}
          {showBuyHistory && (
            <div className="table-responsive buy-history-content">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th className="text-center">ID</th>
                    <th className="text-center">Date Start</th>
                    <th className="text-center">Date End</th>
                    <th className="text-center">Amount</th>
                    <th className="text-center">Program</th>
                    <th className="text-center">Interest</th>
                    <th className="text-center">Profit BNB</th>
                    <th className="text-center">Profit BNBK</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isGetedData &&
                    historyData.map((value, index) => (
                      <tr>
                        <th scope="row" className="text-center">
                          {index + 1}
                        </th>
                        <td className="text-center">
                          {new Date(value.date_started)
                            .toISOString()
                            .substring(0, 10)}
                        </td>
                        <td className="text-center">
                          {new Date(value.date_finished)
                            .toISOString()
                            .substring(0, 10)}
                        </td>
                        <td className="text-center">{value.amount_bnb}</td>
                        <td className="text-center">{value.program_type}</td>
                        <td className="text-center">
                          {value.interest_per_day}
                        </td>
                        <td className="text-center">
                          {value.current_bnb_profit}
                        </td>
                        <td className="text-center">
                          {value.current_bnb_profit}
                        </td>
                        <td className="text-center">
                          {value.is_complete ? "Completed" : "Pending"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          {/* .block @e */}
        </div>
      </section>
      {/* // */}

      {/* // */}
      <section className="section section-roadmap bg-black" id="roadmap">
        <div className="container">
          {/* Section Head @s */}
          <div className="section-head text-center wide-auto">
            <h6
              className="title title-xs title-light animated fadeInUp"
              data-animate="fadeInUp"
              data-delay=".1"
              style={{ visibility: "visible", animationDelay: "0.1s" }}
            >
              {" "}
              The roadmap to success
            </h6>
            <h2
              className="title title-lg title-dark animated fadeInUp"
              data-animate="fadeInUp"
              data-delay=".2"
              style={{ visibility: "visible", animationDelay: "0.2s" }}
            >
              What are our major goals?
            </h2>
            <p
              className="animated fadeInUp"
              data-animate="fadeInUp"
              data-delay=".3"
              style={{ visibility: "visible", animationDelay: "0.3s" }}
            >
              Our market strategy will prioritise blockchain technology rollout
              to utilities based on their transformation. View our roadmap to
              see how exactly we are making that happen.{" "}
            </p>
          </div>
          {/* .section-head @e */}
          {/* Block @s */}
          <div className="nk-block nk-block-roadmap">
            <div className="row justify-content-center">
              <div className="col-xl-10">
                <div className="roadmap-wrap">
                  <div className="roadmap-line" />
                  <div
                    className="roadmap animated fadeInUp"
                    data-animate="fadeInUp"
                    data-delay=".4"
                    style={{ visibility: "visible", animationDelay: "0.4s" }}
                  >
                    <div className="roadmap-year">2022</div>
                  </div>
                  <div
                    className="roadmap roadmap-right roadmap-finished animated fadeInUp"
                    data-animate="fadeInUp"
                    data-delay=".5"
                    style={{ visibility: "visible", animationDelay: "0.5s" }}
                  >
                    <div className="roadmap-step">
                      <div className="roadmap-head">
                        <span className="roadmap-time">Step 1: </span>
                        <span className="roadmap-title">
                          Form Idea and Build a team
                        </span>
                      </div>
                      <ul className="list list-dot">
                        <li>Brand creation</li>
                        <li>Develope a detailed plan</li>
                        <li>Ecosystem creation</li>
                        <li>Market measurement</li>
                        <li>
                          Gather top experts in blockchain, business management
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div
                    className="roadmap roadmap-left roadmap-finished animated fadeInUp"
                    data-animate="fadeInUp"
                    data-delay=".6"
                    style={{ visibility: "visible", animationDelay: "0.6s" }}
                  >
                    <div className="roadmap-step">
                      <div className="roadmap-head">
                        <span className="roadmap-time">Step 2: </span>
                        <span className="roadmap-title">
                          Project construction
                        </span>
                      </div>
                      <ul className="list list-dot">
                        <li>Update information on BSC scan</li>
                        <li>Create and finalize whitepaper, smart contract</li>
                        <li>Deploy jobs</li>
                        {/*  <li>Marketing via Poocoin,twitter, telegram...</li> */}
                      </ul>
                    </div>
                  </div>
                  <div
                    className="roadmap roadmap-right animated fadeInUp"
                    data-animate="fadeInUp"
                    data-delay=".5"
                    style={{ visibility: "visible", animationDelay: "0.5s" }}
                  >
                    <div className="roadmap-step">
                      <div className="roadmap-head">
                        <span className="roadmap-time">Step 3:</span>
                        <span className="roadmap-title">
                          Announce products, BNBK’s ecosystem and Build investor
                          community
                        </span>
                      </div>
                      <ul className="list list-dot">
                        <li>Launch BNBK token</li>
                        <li>Announce the investment program to 20% /day</li>
                        <li>Make an advertising campaigns</li>
                        <li>
                          Build the largest investment community in the world
                        </li>
                        <li>Open presale</li>
                        <li>
                          Pancakeswap listing, Coingecko listing, Coinmarketcap
                          listing{" "}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div
                    className="roadmap roadmap-left animated fadeInUp"
                    data-animate="fadeInUp"
                    data-delay=".6"
                    style={{ visibility: "visible", animationDelay: "0.6s" }}
                  >
                    <div className="roadmap-step">
                      <div className="roadmap-head">
                        <span className="roadmap-time">Step 4:</span>
                        <span className="roadmap-title">
                          Launch BK Auction and list BNBK on the exchange
                        </span>
                      </div>
                      <ul className="list list-dot">
                        <li>Introducing BK Auction Exchange</li>
                        <li>Make an marketing campaigns</li>
                        <li>Organize an auction online and offline monthly</li>
                        <li>Attract users and communities</li>
                      </ul>
                    </div>
                  </div>
                  <div
                    className="roadmap roadmap-right animated fadeInUp"
                    data-animate="fadeInUp"
                    data-delay=".5"
                    style={{ visibility: "visible", animationDelay: "0.5s" }}
                  >
                    <div className="roadmap-step">
                      <div className="roadmap-head">
                        <span className="roadmap-time">Step 5: </span>
                        <span className="roadmap-title">
                          Launch BK exchange and burn Token
                        </span>
                      </div>
                      <ul className="list list-dot">
                        <li>Launch BK exchange</li>
                        <li>Make an marketing campaigns</li>
                        <li>
                          Implement the 1% monthly revenue program to burn BNBK
                          token to increase token value
                        </li>
                        <li>
                          Coinbase Listing, Huobi Listing, FTX listing, Kraken
                          listing, Gate.io listing
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div
                    className="roadmap roadmap-left animated fadeInUp"
                    data-animate="fadeInUp"
                    data-delay=".6"
                    style={{ visibility: "visible", animationDelay: "0.6s" }}
                  >
                    <div className="roadmap-step">
                      <div className="roadmap-head">
                        <span className="roadmap-time">Step 6: </span>
                        <span className="roadmap-title">
                          Launch NFT exchange và NFT products
                        </span>
                      </div>
                      <ul className="list list-dot">
                        <li>Launch NFT market place</li>
                        <li>Release NFT Casino collection</li>
                        <li>Listing more CEX: Binance, Global, Bitfinex </li>
                      </ul>
                    </div>
                  </div>
                  <div
                    className="roadmap roadmap-right animated fadeInUp"
                    data-animate="fadeInUp"
                    data-delay=".5"
                    style={{ visibility: "visible", animationDelay: "0.5s" }}
                  >
                    <div className="roadmap-step">
                      <div className="roadmap-head">
                        <span className="roadmap-time">Step 7: </span>
                        <span className="roadmap-title">
                          Improve already launched products and develop new
                          products
                        </span>
                      </div>
                      <ul className="list list-dot">
                        <li>
                          Launch the real estate collections, NFT resorts
                          collections, hotel restaurants collections
                        </li>
                        <li>Expand the closed ecosystem</li>
                        <li>Capture other ecosystems</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* .col */}
            </div>
            {/* .row */}
            <div
              className="text-center animated fadeInUp"
              data-animate="fadeInUp"
              data-delay=".4"
              style={{ visibility: "visible", animationDelay: "0.4s" }}
            >
              <a
                href="https://docs.bnbkingdom.io/bnb-kingdom-roadmap"
                className="btn btn-grad"
              >
                View Full Roadmap
              </a>
            </div>
          </div>
          {/* Block @e */}
        </div>
      </section>
      {/* // */}
      <section className="section bg-theme-alt tc-light" id="team">
        <div className="container">
          <div className="section-head section-head-s9 wide-md">
            <h6
              className="title title-xs title-s1 tc-primary animated"
              data-animate="fadeInUp"
              data-delay=".1"
            >
              Team
            </h6>
            <h2
              className="title title-semibold animated"
              data-animate="fadeInUp"
              data-delay=".2"
            >
              Developed By
            </h2>
          </div>
          {/* Block @s */}
          <Team />
          {/* Block @e */}
        </div>
      </section>
      <section className="section bg-theme-alt tc-light" id="partner">
        <div className="container">
          <div className="section-head section-head-s9 wide-md">
            <h6
              className="title title-xs title-s1 tc-primary animated"
              data-animate="fadeInUp"
              data-delay=".1"
            >
              Partners
            </h6>
            <h2
              className="title title-semibold animated"
              data-animate="fadeInUp"
              data-delay=".2"
            >
              Supported By
            </h2>
          </div>
          {/* Block @s */}
          <div className="nk-block block-partners mgb-m30">
            <ul className="partner-list partner-list-left partner-list-s3 flex-wrap">
              <li
                className="partner-logo partner-logo-s2 animated border rounded-xl text-center justify-center flex-col flex h-xxxl bg-deep\/50 bg"
                data-animate="fadeInUp"
                data-delay=".3"
              >
                <img
                  className="new-partners-logo"
                  src="images/partners/2560px-Binance_logo.svg.png"
                  alt="partner"
                />
              </li>
              <li
                className="partner-logo partner-logo-s2 animated border rounded-xl text-center justify-center flex-col flex h-xxxl bg-deep\/50 bg"
                data-animate="fadeInUp"
                data-delay=".35"
              >
                <img
                  className="new-partners-logo"
                  src="images/partners/coingecko.png"
                  alt="partner"
                />
              </li>
              <li
                className="partner-logo partner-logo-s2 animated border rounded-xl text-center justify-center flex-col flex h-xxxl bg-deep\/50 bg"
                data-animate="fadeInUp"
                data-delay=".35"
              >
                <img
                  className="new-partners-logo"
                  src="images/partners/Coinmarketcap.png"
                  alt="partner"
                />
              </li>
              <li
                className="partner-logo partner-logo-s2 animated border rounded-xl text-center justify-center flex-col flex h-xxxl bg-deep\/50 bg"
                data-animate="fadeInUp"
                data-delay=".35"
              >
                <img
                  className="new-partners-logo"
                  src="images/partners/pancake.png"
                  alt="partner"
                />
              </li>
              <li
                className="partner-logo partner-logo-s2 animated border rounded-xl text-center justify-center flex-col flex h-xxxl bg-deep\/50 bg"
                data-animate="fadeInUp"
                data-delay=".35"
              >
                <img
                  className="new-partners-logo"
                  src="images/partners/Cryptomines.png"
                  alt="partner"
                />
              </li>
              <li
                className="partner-logo partner-logo-s2 animated border rounded-xl text-center justify-center flex-col flex h-xxxl bg-deep\/50 bg"
                data-animate="fadeInUp"
                data-delay=".35"
              >
                <img
                  className="new-partners-logo"
                  src="images/partners/Betfury.png"
                  alt="partner"
                />
              </li>
              <li
                className="partner-logo partner-logo-s2 animated border rounded-xl text-center justify-center flex-col flex h-xxxl bg-deep\/50 bg"
                data-animate="fadeInUp"
                data-delay=".35"
              >
                <img
                  className="new-partners-logo"
                  src="images/partners/dapp.png"
                  alt="partner"
                />
              </li>
              <li
                className="partner-logo partner-logo-s2 animated border rounded-xl text-center justify-center flex-col flex h-xxxl bg-deep\/50 bg"
                data-animate="fadeInUp"
                data-delay=".35"
              >
                <img
                  className="new-partners-logo"
                  src="images/partners/hotbit.png"
                  alt="partner"
                />
              </li>
              <li
                className="partner-logo partner-logo-s2 animated border rounded-xl text-center justify-center flex-col flex h-xxxl bg-deep\/50 bg"
                data-animate="fadeInUp"
                data-delay=".35"
              >
                <img
                  className="new-partners-logo"
                  src="images/partners/kalata.png"
                  alt="partner"
                />
              </li>
              <li
                className="partner-logo partner-logo-s2 animated border rounded-xl text-center justify-center flex-col flex h-xxxl bg-deep\/50 bg"
                data-animate="fadeInUp"
                data-delay=".35"
              >
                <img
                  className="new-partners-logo"
                  src="images/partners/pinecone.png"
                  alt="partner"
                />
              </li>
            </ul>
          </div>
          {/* Block @e */}
        </div>
      </section>
      {/* // */}

      <section
        className="section section-contact bg-theme-alt tc-light ov-h"
        id="contact"
      >
        <div className="container">
          {/* Block @s */}
          <div className="nk-block block-contact">
            <div className="row justify-content-center gutter-vr-30px">
              <div className="col-lg-3">
                <div className="section-head section-head-sm section-head-s9 tc-light text-center text-lg-left">
                  <h6
                    className="title title-xs title-s1 tc-primary animated"
                    data-animate="fadeInUp"
                    data-delay=".1"
                  >
                    Contact
                  </h6>
                  <h2
                    className="title animated"
                    data-animate="fadeInUp"
                    data-delay=".2"
                  >
                    Get In Touch
                  </h2>
                  <p
                    className="animated"
                    data-animate="fadeInUp"
                    data-delay=".3"
                  >
                    Any question? Reach out to us and we’ll get back to you
                    shortly.
                  </p>
                </div>
                <div className="d-flex flex-column justify-content-between h-100">
                  <ul className="contact-list contact-list-s2">
                    <li
                      className="animated"
                      data-animate="fadeInUp"
                      data-delay=".4"
                    >
                      <em className="contact-icon fab fa-twitter" />
                      <div className="contact-text">
                        <span>@BNBKINGDOM_GAME</span>
                      </div>
                    </li>
                    <li
                      className="animated"
                      data-animate="fadeInUp"
                      data-delay=".5"
                    >
                      <em className="contact-icon fas fa-envelope" />
                      <div className="contact-text">
                        <span>support@BNBKINGDOM.online</span>
                      </div>
                    </li>
                    <li
                      className="animated"
                      data-animate="fadeInUp"
                      data-delay=".6"
                    >
                      <em className="contact-icon fas fa-paper-plane" />
                      <div className="contact-text">
                        <span>Join us on Telegram</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              {/* .col */}
              <div className="col-lg-4 offset-lg-1">
                <div className="gap-6x d-none d-lg-block" />
                <div className="gap-4x d-none d-lg-block" />
                <form
                  id="contact-form-01"
                  className="contact-form nk-form-submit"
                  action="form/contact.php"
                  method="post"
                >
                  <div
                    className="field-item field-item-s2 animated"
                    data-animate="fadeInUp"
                    data-delay=".7"
                  >
                    <input
                      name="contact-name"
                      type="text"
                      className="input-bordered required"
                      placeholder="Your Name"
                    />
                  </div>
                  <div
                    className="field-item field-item-s2 animated"
                    data-animate="fadeInUp"
                    data-delay=".8"
                  >
                    <input
                      name="contact-email"
                      type="email"
                      className="input-bordered required email"
                      placeholder="Your Email"
                    />
                  </div>
                  <div
                    className="field-item field-item-s2 animated"
                    data-animate="fadeInUp"
                    data-delay=".9"
                  >
                    <textarea
                      name="contact-message"
                      className="input-bordered input-textarea required"
                      placeholder="Your Message"
                      defaultValue={""}
                    />
                  </div>
                  <input
                    type="text"
                    className="d-none"
                    name="form-anti-honeypot"
                    defaultValue
                  />
                  <div className="row">
                    <div
                      className="col-sm-12 animated"
                      data-animate="fadeInUp"
                      data-delay={1}
                    >
                      <button
                        type="submit"
                        className="btn btn-s2 btn-md btn-grad"
                      >
                        Submit
                      </button>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-results" />
                    </div>
                  </div>
                </form>
              </div>
              {/* .col */}
              <div className="col-lg-4 align-self-center">
                <div
                  className="nk-block-img animated"
                  data-animate="fadeInUp"
                  data-delay="1.1"
                >
                  {/* <img src="images/gfx/gfx-q.png" alt="lungwort" /> */}
                </div>
              </div>
              {/* .col */}
            </div>
            {/* .row */}
          </div>
          {/* .block @e */}
        </div>
      </section>
      <footer className="nk-footer bg-theme-dark">
        <div className="tc-light">
          <div className="container">
            {/* Block @s */}
            <div className="nk-block">
              <div
                className="bg-theme-accent-alt round subscribe-wrap animated"
                data-animate="fadeInUp"
                data-delay=".1"
              >
                <div className="row text-center text-md-left justify-content-center align-items-center gutter-vr-25px">
                  <div className="col-lg-6">
                    <div className="wide-auto-sm">
                      <h4 className="title-sm">Don't miss out, Stay updated</h4>
                      <p>
                        Sign up for updates and market news. Subscribe to our
                        newsletter and receive update about BNBKINGDOM Project
                      </p>
                    </div>
                  </div>
                  {/* .col */}
                  <div className="col-lg-6">
                    <div className="gap-3x d-none d-lg-block" />
                    <form
                      action="form/subscribe.php"
                      className="nk-form-submit"
                      method="post"
                    >
                      <div className="field-inline field-inline-s2 field-inline-s2-sm bg-white shadow-soft">
                        <div className="field-wrap">
                          <input
                            className="input-solid input-solid-md required email"
                            type="text"
                            name="contact-email"
                            placeholder="Enter your email"
                          />
                          <input
                            type="text"
                            className="d-none"
                            name="form-anti-honeypot"
                            defaultValue
                          />
                        </div>
                        <div className="submit-wrap">
                          <button className="btn btn-md btn-grad">
                            Subscribe
                          </button>
                        </div>
                      </div>
                      <div className="form-results" />
                    </form>
                  </div>
                  {/* .col */}
                </div>
                {/* .row */}
              </div>
            </div>
            {/* .block @e */}
          </div>
          <div className="nk-ovm ovm-top ovm-h-50 bg-theme-alt" />
          {/* .nk-ovm */}
        </div>
        <div className="section section-footer section-m tc-light bg-transparent ov-h">
          <div className="container">
            {/* Block @s */}
            <div className="nk-block block-footer">
              <div className="row">
                <div className="col">
                  <div className="wgs wgs-text text-center mb-3">
                    <ul className="social pdb-l justify-content-center">
                      <li>
                        {" "}
                        <div className="circle">
                          <a href="https://t.me/+KcAJFWXWUDY1NGY1">
                            <em className="new-social-icon fab fa-telegram" />
                          </a>
                        </div>
                      </li>
                      <li>
                        <div className="circle">
                          <a href="https://t.me/bnbkingdomchannel">
                            <em className="new-social-icon fab fa-telegram" />
                          </a>
                        </div>
                      </li>
                      <li>
                        <div className="circle">
                          <a href="https://twitter.com/bnbkingdom2022?t=DPqVpL7cr1X8Ku6iSOqu2g&s=09">
                            <em className="new-social-icon fab fa-twitter" />
                          </a>
                        </div>
                      </li>
                      <li>
                        <div className="circle">
                          <a href="#">
                            <em className="new-social-icon fab fa-youtube" />
                          </a>
                        </div>
                      </li>
                    </ul>
                    <a href="./" className="footer-logo">
                      <img
                        src="images/logofull.png"
                        srcSet="images/logofull.png"
                        alt="logo"
                      />
                    </a>
                    <div className="copyright-text copyright-text-s3 pdt-m">
                      <p>
                        <span className="d-sm-block">
                          Copyright © 2022, BNBKINGDOM. Template Made By{" "}
                          <a href="./">Softnio</a> &amp; Handcrafted by iO.{" "}
                        </span>
                        All trademarks and copyrights belong to their respective
                        owners.
                      </p>
                    </div>
                  </div>
                </div>
                {/* .col */}
              </div>
              {/* .row */}
            </div>
            {/* .block @e */}
          </div>
          <div className="nk-ovm shape-s" />
        </div>
      </footer>
      <div className="preloader">
        <span className="spinner spinner-round" />
      </div>
      {() => {
        if (window.innerWidth < 992) {
          setNavMenuMobile(true);
        }
      }}
    </div>
  );
}

export default Home;
