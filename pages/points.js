import Script from "next/script";
import React, { Component, useState, useEffect } from "react";
import ProgressBarCountdown from "../components/progressbarcountdown";
import styles from "../styles/Home.module.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { isArray } from "tls";


const connectAtom = atomWithStorage('connectPersistant', false)
const accountAtom = atomWithStorage('accountPersistant', "0x")

export default function Home() {
  const [firstHeading, setFirstHeading] = useState("COME BACK ON THE 1ST")
  const [collect, setCollect] = useState(false);
  const [total_points, setTotal_points] = useState(0)
  const [hasUnclaimedPoints, setHasUnclaimedPoints] = useState(false);
  const [openseaData, setOpenseaData] = useState(false);

  const [isConnected, setIsConnected] = useAtom(connectAtom)
  const [account, setAccount] = useAtom(accountAtom);
  // const [isConnected, setIsConnected] = useState(false);
  // const [account, setAccount] = useState("0x");

  const childToParent = (childdata) => {
    setOpenseaData(childdata);
  };

  useEffect(()=>{
    if(window.ethereum != undefined){
      window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        let tempAccount = accounts[0];
        // console.log('this is temp account '+tempAccount)
        if(tempAccount){
          if(tempAccount.length == 42){
            setAccount(tempAccount)
            fetch('api/get_points?wallet='+tempAccount)
            .then((res) => res.json())
            .then((data) => {
              setTotal_points(data.points);
            })
          }else{
            alert(tempAccount.length)
          }
          
          setIsConnected(true)
        }else{
          setIsConnected(false)
          setHasUnclaimedPoints(false)
          setAccount('0x')
        }
      })
    }
  },[setAccount,account, setIsConnected])

  useEffect(() => {
    if(account != "0x"){
      setIsConnected(true)
      fetch('api/get_points?wallet='+account)
      .then((res) => res.json())
      .then((data) => {
        setTotal_points(data.points);
      })

      global.account = account;
    }else{
      setIsConnected(false)
    }
  }, [account,setIsConnected])

  useEffect(() => {
    console.log(total_points)
    if(total_points > 0){
      setFirstHeading('YOU HAVE UNUSED POINTS!')
      setCollect(true)
      setHasUnclaimedPoints(true)
    }else if (total_points === 0){
      setHasUnclaimedPoints(false)
    }else if(total_points == "not_found"){
      setFirstHeading("Welcome to CRYPTOGIRL rewards!")
      setCollect(false)
    }
  }, [total_points])


  
  return (
    <div className={styles.points_page_container}  suppressHydrationWarning={true}>
      <div>
        <h1>CRYPTOGIRL</h1>
        <h2>POINTS</h2>
        <ClientOnly>
          {isConnected ? <WalletConnected /> : <WalletNotConnected />}
        </ClientOnly>



        <Script
          src="/static/inline.js"
          onLoad={() => {
            // If loaded successfully, then you can load other scripts in sequence
          }}
        />
      </div>
    </div>
  );

  function Unclaimed_points() {
    return (
      <>
        <h2 className={styles.unused_points}>{firstHeading}</h2>
        {collect ? <Collect/> : <NoCollect />}
      </>
    );
  }
  function Collect(){
    return (
      <>
        {/* <button className={styles.collect + " " + styles.animated_anchor}>
          COLLECT THEM NOW
        </button> */}
        <h5>YOUR TOTAL POINTS: {total_points}</h5>
      </>
    )
  }
  function NoCollect(){
    return (<h2>{'You have been registered, come back on the 1st to collect your points!'}</h2>)
  }
  function No_unclaimed() {
    return (
      <>
        <h2 className={styles.unused_points}>You have no points.</h2>
      </>
    );
  }
  function DisconnectBtn(){
    function disconnect(){
      if(typeof window.ethereum !== "undefined"){
        console.log('disconnect metamask')
        setAccount('0x')
      }else{
        const connector = new WalletConnect({
          bridge: "https://bridge.walletconnect.org", // Required
          qrcodeModal: QRCodeModal,
        });

        connector.killSession()
        setAccount('0x')
      }

    }
    return (
      <button className={styles.withdraw+" "+styles.disconnect_button} onClick={() => disconnect()}>Disconnect</button>
    )
  }
  function WalletConnected() {
    return (
      <>
        <DisconnectBtn />
        {hasUnclaimedPoints ? <Unclaimed_points /> : <No_unclaimed />}
        <div className={styles.progress_container}>
          <div>
            <h6>FUTURE POINTS WILL BE READY&nbsp;IN:</h6>
          </div>

          <ClientOnly>
            <ProgressBarCountdown />
          </ClientOnly>
        </div>

        <div className={styles.slider_container_points}>
          <Custom_carousel />
        </div>

        <p>
          Cryptogirl points is a source of passive income for all Cryptogirl NFT holders!
          The lucky few who have unique pieces receive massive rewards!
        </p>

        {/* {collect ? <button className={styles.withdraw + " " + styles.animated_anchor}>WITHDRAW</button> : <></> } */}
      </>
    );
  }
  async function connect(){
    if(window.ethereum){
      try {
        global.account = await ethereum.request({method: "eth_requestAccounts"});
        setAccount(global.account);
  
        
      } catch (error) {
        console.log(error)
      }
    }else{
      if(typeof window !== "undefined"){
        if(typeof window.ethereum !== "undefined"){
          console.log('Metamasks Present!')
        }else{
          //wallet connect 
          // Create a connector
          const connector = new WalletConnect({
            bridge: "https://bridge.walletconnect.org", // Required
            qrcodeModal: QRCodeModal,
          });
      
          // Check if connection is already established
          if (!connector.connected) {
            // create new session
            connector.createSession();
          }
      
          // Subscribe to connection events
          connector.on("connect", (error, payload) => {
            if (error) {
              throw error;
            }else{
              // console.log(payload)
            }
      
            // Get provided accounts and chainId
            const { accounts, chainId } = payload.params[0];
            setAccount(accounts);
          });
      
          connector.on("session_update", (error, payload) => {
            if (error) {
              throw error;
            }else{
              // console.log(payload)
            }
      
            // Get updated accounts and chainId
            const { accounts, chainId } = payload.params[0];
            setAccount(accounts);
          });
      
          connector.on("disconnect", (error, payload) => {
            if (error) {
              throw error;
            }else{
              // console.log(payload)
            }
      
            // Delete connector
          });

          if(connector.accounts[0]){
            if(connector.accounts[0].startsWith('0x')){
              setAccount(connector.accounts[0]);
            }
          }
      
        }
      }else{
        console.log('Window not defined')
      }
      setIsConnected(false);
    }
  }
  
  
  
  function WalletNotConnected() {
    return (
      <>
        <h2 className={styles.marginTopBot}>Wallet not connected, please connect below!</h2>
        <button className={styles.withdraw} onClick={() => connect()}>Connect!</button> 
      </>
    );
  }
}

export function ClientOnly({ children, ...delegated }) {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return (
    <div {...delegated}>
      {children}
    </div>
  );
}

export async function changeNFTimages(){
  if(global.account){
    let opensea_api_url = "https://api.opensea.io/api/v1/assets?format=json&owner="+global.account;

    const api_call = await fetch(opensea_api_url);
    const data = await api_call.json();
    var to_return = [];

    if(data.assets){
      if(data.assets.length > 0){
        data.assets.forEach(element => {
          if(element.name.startsWith("Crypto Girl Collectable #")){
            to_return.push(element.image_url);
          }
        });
      }else{
        to_return = "You have no nfts"
      }
    }else{
      to_return = "You have no nfts"
    }



    // daca nu ai nft uri cu cryptogirl sa ti zica
    return to_return;
  }
}
export class Custom_carousel extends Component {
  constructor(props){
    super(props);
    this.state = {
      slides: []
    };
  }

  async componentDidMount(){
    const promise = Promise.resolve(changeNFTimages()).then((result)=>{

      const { slides } = this.state;
      this.setState({
        slides: result
      });
    })
  }
  render() {
    let text = "YOUR CRYPTOGIRLS"
    var slidesToShow = 0;
    if(this.state.slides){
      if(this.state.slides.length > 2){
        slidesToShow = 3;
      }else if(this.state.slides.length == 2){
        slidesToShow = 2;
      }else if(this.state.slides == 0){
        text = '';
        slidesToShow = 0;
      }else{
        slidesToShow = 1
      }
    }
    const settings = {
      arrows: true,
      slidesToShow: slidesToShow,
      slidesToScroll: 1,
      autoplay: true,
      speed: 2000,
      infinite: true,
      autoplaySpeed: 5000,
      width: 1000,
      responsive: [
        {
          breakpoint: 1000,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 700,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    };

    if(isArray(this.state.slides)){
      /* eslint-disable */
      return (
        <>
          <div>
            <h6>{text}</h6>
          </div>
          <div className={styles.points_slider} id="slider_carousel">
            <Slider {...settings}>
              {this.state.slides.map(function(slide) {
                return (
                  <div key={slide}>
                    <img alt="" src={slide} className="nft_image" />
                  </div>
                );
              })}
            </Slider>
          </div>
        </>
      );
    }else{
      return (<h2 className={styles.no_cgc}>You have no CryptoGirl Collectables, you can buy some  <a href="https://opensea.io/collection/cryptogirl-collectables" target="_blank" rel="noreferrer noopener">here</a>!</h2>)
    }
  }
}
