
import React, { Component, useState, useEffect } from 'react';
import Web3ModalButton from '../../components/Web3ModalButton';
import Footer from '../../components/Footer';
import "./index.module.scss";
import { useEthers, useContractFunction, useCall, useTokenBalance, useTokenAllowance, useEtherBalance  } from '@usedapp/core'
import {useCoingeckoPrice } from '@usedapp/coingecko';
import { utils, Contract, constants } from 'ethers'
import useCountdown from "../../hooks/useCountdown";
import DggLogo from '../../public/static/assets/logo.png';
import LogoReflect from '../../public/static/assets/images/logoreflect.png';
import DggMascot from '../../public/static/assets/images/Refined Mascot Full.png';
import PoweredByCz from '../../public/static/assets/images/poweredbycz.png';
import BackgroundImage from '../../public/static/assets/images/bg.jpg';
import TopVideo from '../../public/static/assets/vids/bgv2.mp4';
import { shortenAddress, useLookupAddress} from '@usedapp/core'
import DggSaleAbi from "../../abi/DggSale.json";
import IERC20Abi from "../../abi/IERC20.json";
import {  ADDRESS_CZUSD, ADDRESS_BUSD, ADDRESS_USDC, ADDRESS_USDT, ADDRESS_DGGSALE } from '../../constants/addresses';
const { formatEther, parseEther, Interface } = utils;

const DggSaleInterface = new Interface(DggSaleAbi);
const DggaleContract = new Contract(ADDRESS_DGGSALE,DggSaleInterface);

const Ierc20Interface = new Interface(IERC20Abi);
const CONTRACT_BUSD = new Contract(ADDRESS_BUSD,Ierc20Interface);
const CONTRACT_USDC = new Contract(ADDRESS_USDC,Ierc20Interface);
const CONTRACT_USDT = new Contract(ADDRESS_USDT,Ierc20Interface);



const displayWad = (wad)=>!!wad ? Number(formatEther(wad)).toFixed(2) : "...";

function Home() {
  
  const { account, chainId } = useEthers();
  console.log(chainId)
  


  return (<>
    <section id="top" className="hero has-text-centered">
      <div className="m-0 p-0" style={{position:"relative",width:"100%"}}>
        <video autoPlay loop muted style={{position:"absolute",objectFit:"cover",width:"100vw",left:"0",top:"0",maxHeight:"8em", backgroundColor:"rgb(50,50,50)"}}>
          <source src={TopVideo} type="video/mp4" />
        </video>
        <Web3ModalButton className="mt-5 mb-5" />
        <p className='has-text-grey-lighter is-size-7 is-dark' style={{position:"relative",zIndex:"2", backgroundColor:"rgba(50,50,50,0.8)"}}>
          <span className="mr-2 mb-0 is-inline-block has-text-left" style={{width:"11em"}}>Network: {!!account ? (chainId == 56 ? (<span className="has-text-success">✓ BSC</span>) : <span className="has-text-error has-text-danger">❌NOT BSC</span>) : "..."}</span>
          <span className="mt-0 is-inline-block has-text-left" style={{width:"11em"}}>Wallet: {!!account ? shortenAddress(account) : "..."}</span>
        </p>
      </div>
    </section>
    
    <Footer />
    
  </>);
}

export default Home
