
import React, { Component, useState, useEffect } from 'react';
import Web3ModalButton from '../../components/Web3ModalButton';
import Footer from '../../components/Footer';
import "./index.module.scss";
import { useEthers, useToken, useContractFunction, useCall, useTokenBalance, useTokenAllowance, useEtherBalance  } from '@usedapp/core'
import {useCoingeckoPrice } from '@usedapp/coingecko';
import { utils, Contract, constants } from 'ethers';
import useAutoRewardPool from "../../hooks/useAutoRewardPool";
import useDgodLock from "../../hooks/useDgodLock";
import useCountdown from "../../hooks/useCountdown";
import useCurrentEpoch from "../../hooks/useCurrentEpoch";
import OracleBanner from '../../public/static/assets/images/oracle-BannerV2.png';
import HeaderBanner from '../../public/static/assets/images/headerbanner.png';
import CZCashLogo from '../../public/static/assets/images/czcash.png';
import TopVideo from '../../public/static/assets/vids/bgv3.mp4';
import { shortenAddress, useLookupAddress} from '@usedapp/core'
import IERC20Abi from "../../abi/IERC20.json";
import DgodAbi from "../../abi/Dgod.json";
import DgodLockAbi from "../../abi/DgodLock.json";
import AutoRewardPoolAbi from "../../abi/AutoRewardPool.json";
import { SOCIAL_TWITTER, SOCIAL_TELEGRAM, SOCIAL_GITHUB} from '../../constants/social';
import {deltaCountdown} from '../../utils/timeDisplay';
import {weiToShortString, tokenAmtToShortString, weiToFixed, weiToUsdWeiVal, toShortString} from '../../utils/bnDisplay';
import { ADDRESS_TEAM, ADDRESS_MARKETING, ADDRESS_DOGE, ADDRESS_DGOD, ADDRESS_AUTO_REWARD_POOL, ADDRESS_DGOD_LOCK, ADDRESS_DGODCZUSD_PAIR, ADDRESS_CZUSD} from '../../constants/addresses';
import { czCashBuyLink } from '../../utils/dexBuyLink';
const { formatEther, parseEther, Interface } = utils;

const DgodInterface = new Interface(DgodAbi);
const CONTRACT_DGOD = new Contract(ADDRESS_DGOD,DgodInterface);

const AutoRewardPoolInterface = new Interface(AutoRewardPoolAbi);
const CONTRACT_AUTO_REWARD_POOL = new Contract(ADDRESS_AUTO_REWARD_POOL,AutoRewardPoolInterface);

const DgodLockInterface = new Interface(DgodLockAbi);
const CONTRACT_DGOD_LOCK = new Contract(ADDRESS_DGOD_LOCK,DgodLockInterface);

const Ierc20Interface = new Interface(IERC20Abi);
const CONTRACT_DOGE = new Contract(ADDRESS_DOGE,Ierc20Interface);
const CONTRACT_DGODCZUSD_PAIR = new Contract(ADDRESS_DGODCZUSD_PAIR,Ierc20Interface);



const displayWad = (wad)=>!!wad ? Number(formatEther(wad)).toFixed(2) : "...";

const INITIAL_DGOD_PRICE = "0.000008043";
const INITIAL_DGOD_PRICE_FLOOR = "0.000005002";
const INTIAL_DGOD_SUPPLY = parseEther("10000000000");

function Home() {
  
  const { account, library, chainId } = useEthers();

  const { state:stateClaim, send:sendClaim } = useContractFunction(
  CONTRACT_AUTO_REWARD_POOL,
  'claim');

  const { state:stateWithdraw, send:sendWithdraw } = useContractFunction(
  CONTRACT_DGOD_LOCK,
  'claimDgg');

  const dgodInfo = useToken(ADDRESS_DGOD);
  const dgodCzusdPairInfo = useToken(ADDRESS_DGODCZUSD_PAIR);
  
  const accDogeBal = useTokenBalance(ADDRESS_DOGE, account);
  const accDgodBal = useTokenBalance(ADDRESS_DGOD, account);
  const marketingDogeBal = useTokenBalance(ADDRESS_DOGE, ADDRESS_MARKETING);
  const teamDgodBal = useTokenBalance(ADDRESS_DOGE, ADDRESS_TEAM);
  const lpCzusdBal = useTokenBalance(ADDRESS_CZUSD, ADDRESS_DGODCZUSD_PAIR);
  const lpDgodBal = useTokenBalance(ADDRESS_DGOD, ADDRESS_DGODCZUSD_PAIR);
  const lockedLpTokens = useTokenBalance(ADDRESS_DGODCZUSD_PAIR, ADDRESS_DGOD);
  const czusdPrice = useCoingeckoPrice("czusd");
  const dogePrice = useCoingeckoPrice("dogecoin");

  const currentEpoch = useCurrentEpoch();

  const [dgodPrice,setDgodPrice] = useState("0");
  const [dgodMcapWad,setDgodMcapWad] = useState(parseEther("0"));
  const [dgodPriceFloor,setDgodPriceFloor] = useState("0");
  const [dogeTotalPaidWad,setDogeTotalPaidWad] = useState(parseEther("0"));
  const [dgodAprWad,setDgodAprWad] = useState(parseEther("0"));
  const [liqRatioWad,setLiqRatioWad] = useState(parseEther("0"));

  const {
    rewardPerSecond,
    totalRewardsPaid,
    combinedStakedBalance,
    totalRewardsReceived,
    pendingReward,
    isAccountAutoClaim,
    totalStaked
  } = useAutoRewardPool(library,account);

  const {
    firstUnlockEpoch,
    secondUnlockEpoch,
    accountDggInitial,
    accountVestBal,
    accountDggClaimable
  } = useDgodLock(library,account);

  useEffect(()=>{
    if(!czusdPrice || !lpCzusdBal || !lpDgodBal){
      setDgodPrice("0");
      return;
    }
    const priceWad = lpCzusdBal.mul(parseEther(czusdPrice)).div(lpDgodBal);
    setDgodPrice(formatEther(priceWad));

  },[czusdPrice,lpCzusdBal?.toString(),lpDgodBal?.toString()]);

  useEffect(()=>{
    if(!dgodPrice || !dogePrice || !dgodInfo?.totalSupply || !totalRewardsPaid){
      setDgodMcapWad(parseEther("0"));
      setDogeTotalPaidWad(parseEther("0"));
      return;
    }
    const mcapWad = dgodInfo.totalSupply.mul(parseEther(dgodPrice)).div(parseEther("1"));
    setDgodMcapWad(mcapWad);
    const dogePaidUsdWad = totalRewardsPaid.mul(parseEther(dogePrice)).div(10**8);
    setDogeTotalPaidWad(dogePaidUsdWad);
  },[dgodPrice,dogePrice,dgodInfo?.totalSupply?.toString(),totalRewardsPaid?.toString()]);

  useEffect(()=>{
    if(!dgodPrice || !dogePrice || !totalStaked || !rewardPerSecond || totalStaked?.eq(0) || dgodPrice == 0){
      setDgodAprWad(parseEther("0"));
      return;
    }
    const stakedUsd = totalStaked.mul(parseEther(dgodPrice)).div(parseEther("1"));
    const usdPerDay = rewardPerSecond.mul((86400*365).toString()).mul(parseEther(dogePrice)).div(10**8);
    const apr = usdPerDay.mul(parseEther("100")).div(stakedUsd);
    setDgodAprWad(apr);
  },[dgodPrice,dogePrice,totalStaked?.toString(),rewardPerSecond?.toString()]);

  useEffect(()=>{
    if(!lpDgodBal || !dgodInfo?.totalSupply || dgodInfo.totalSupply.eq(0)){
      setLiqRatioWad(parseEther("0"));
      return;
    }
    const ratio = lpDgodBal.mul(2).mul(parseEther("100")).div(dgodInfo.totalSupply);
    setLiqRatioWad(ratio);

  },[lpDgodBal?.toString(),dgodInfo?.totalSupply?.toString()]);

  useEffect(()=>{
    if(!czusdPrice || !lpDgodBal || !lockedLpTokens || !dgodInfo?.totalSupply || !dgodCzusdPairInfo?.totalSupply ){
      setDgodPriceFloor("0");
      return;
    }
    const lockedInvariant = lpCzusdBal.mul(lpDgodBal).mul(lockedLpTokens).div(dgodCzusdPairInfo.totalSupply);
    const lpCzusdBalAfterMaxSell = lockedInvariant.div(dgodInfo.totalSupply);
    const priceWad = lpCzusdBalAfterMaxSell.mul(parseEther(czusdPrice)).div(dgodInfo.totalSupply);
    setDgodPriceFloor(formatEther(priceWad));

  },[czusdPrice,lpCzusdBal?.toString(),lpDgodBal?.toString(),lockedLpTokens?.toString(),dgodInfo?.totalSupply?.toString(),dgodCzusdPairInfo?.totalSupply?.toString()]);


  return (<>
    <section id="top" className="hero has-text-centered">
      <div className="m-0 p-0" style={{position:"relative",width:"100%",height:"7.5em"}}>
        <div style={{position:"absolute",width:"100vw",height:"7.5em",overflow:"hidden"}}>
          <video poster={HeaderBanner} preload="none" autoPlay loop muted style={{display:"inline-block", objectFit:"cover", objectPosition:"center", width:"100vw",minWidth:"1920px",height:"7.5em",position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
          <source src={TopVideo} type="video/mp4" />
        </video>
          
        </div>
        
        <Web3ModalButton className="mt-5 mb-5" />
        <p className='has-text-grey-lighter is-size-7 is-dark' style={{position:"absolute", bottom:"0",left:"0",right:"0",zIndex:"2", backgroundColor:"rgba(0,10,40,0.8)"}}>
          <span className="mr-2 mb-0 is-inline-block has-text-left" style={{width:"11em"}}>Network: {!!account ? (chainId == 56 ? (<span className="has-text-success">✓ BSC</span>) : <span className="has-text-error has-text-danger">❌NOT BSC</span>) : "..."}</span>
          <span className="mt-0 is-inline-block has-text-left" style={{width:"11em"}}>Wallet: {!!account ? shortenAddress(account) : "..."}</span>
        </p>
      </div>
      <div className="m-0 " style={{background:"linear-gradient(301deg, rgba(1,31,23,1) 0%, rgba(5,24,40,1) 100%)",paddingBottom:"5em",paddingTop:"1em"}}>
      <img style={{maxWidth:"480px",width:"100vw",marginLeft:"auto",marginRight:"auto"}} src={OracleBanner} />
      <a target="_blank" href={czCashBuyLink(ADDRESS_DGOD)} className="button is-dark is-outlined is-large mt-0 mb-5 is-rounded" style={{display:"block",width:"12em",border:"solid #126a85 2px",color:"white",marginLeft:"auto",marginRight:"auto",paddingTop:"0.45em"}} >BUY ON <img src={CZCashLogo} style={{height:"1em",marginLeft:"0.1em",position:"relative",top:"0.1em"}} alt="CZ.Cash" /></a>
      <div className="columns is-centered is-vcentered is-multiline pl-2 pr-2 mb-5">
        <div className="stat stat-doge">
          <span className="stat-title">${weiToShortString(dogeTotalPaidWad,2)}</span>
          <span className="stat-content">Total Dogecoin Paid</span>
        </div>
        <div className="stat stat-doge">
          <span className="stat-title">{tokenAmtToShortString(totalRewardsPaid ?? 0,8,2)}</span>
          <span className="stat-content">Total Dogecoin Distributed</span>
        </div>
        <div className="stat stat-doge-small">
          <span className="stat-title">{tokenAmtToShortString(rewardPerSecond?.mul(86400) ?? 0,8,2)}</span>
          <span className="stat-content">Dogecoin Rewards Today</span>
        </div>
        <div className="stat stat-doge-small">
          <span className="stat-title">{tokenAmtToShortString(marketingDogeBal ?? 0,8,2)}</span>
          <span className="stat-content">Total Marketing</span>
        </div>
        <div className="stat stat-dgod">
          <span className="stat-title">${dgodPrice?.substring(0,10)}</span>
          <span className="stat-content">DogeGod Price</span>
        </div>
        <div className="stat stat-dgod">
          <span className="stat-title">+{weiToShortString(parseEther("100").mul(parseEther(dgodPrice)).div(parseEther(INITIAL_DGOD_PRICE)).sub(parseEther("100")),2)}%</span>
          <span className="stat-content">DogeGod % Increase</span>
        </div>
        <div className="stat stat-dgod">
          <span className="stat-title">${dgodPriceFloor?.substring(0,10)}</span>
          <span className="stat-content">DogeGod Floor Price</span>
        </div>
        <div className="stat stat-dgod">
          <span className="stat-title">+{weiToShortString(parseEther("100").mul(parseEther(dgodPriceFloor)).div(parseEther(INITIAL_DGOD_PRICE_FLOOR)).sub(parseEther("100")),2)}%</span>
          <span className="stat-content">Floor % Increase</span>
        </div>
        <div className="stat stat-dgod-small">
          <span className="stat-title">${weiToShortString(weiToUsdWeiVal(INTIAL_DGOD_SUPPLY.sub(dgodInfo?.totalSupply ?? INTIAL_DGOD_SUPPLY),dgodPrice),2)}</span>
          <span className="stat-content">Total DogeGod Burned</span>
        </div>
        <div className="stat stat-dgod-small">
          <span className="stat-title">TBD</span>
          <span className="stat-content">DogeGod Burned Today</span>
        </div>
        <div className="stat stat-dgod-small">
          <span className="stat-title">{weiToShortString(dgodAprWad,2)}%</span>
          <span className="stat-content">DogeGod APR</span>
        </div>
        <div className="stat stat-dgod-small">
          <span className="stat-title">${weiToShortString(dgodMcapWad,2)}</span>
          <span className="stat-content">DogeGod MCAP</span>
        </div>
        <div className="stat stat-dgod-small">
          <span className="stat-title">{weiToShortString(liqRatioWad,2)}%</span>
          <span className="stat-content">Liquidity % of MCAP</span>
        </div>
      </div>
        <h3 className="is-size-3 m-3 mt-5">
          YOUR <span style={{color:"#FFCB16"}}>WALLET</span>
          {!!account ? (
            <span className="is-size-5 is-block" style={{marginTop:"-0.25em"}}>{shortenAddress(account)}</span>
          ) : (<>
            <a className="is-size-5 is-block" style={{marginTop:"-0.25em",textDecoration:"underline",color:"white"}} href="#top">Connect your wallet at top</a>
            <a className="is-size-5 is-block" target="_blank" style={{textDecoration:"underline"}} href={SOCIAL_TELEGRAM}>Need help? Ask on Telegram</a>
          </>)

          }
          
        </h3>
      {!!account && (<>
      <div className="columns is-vcentered is-centered is-multiline pl-5 pr-5 mb-5">
        <div className="stat stat-doge">
          <span className="stat-title">{tokenAmtToShortString(totalRewardsReceived,8,2)}</span>
          <span className="stat-content">Total Dogecoin Earned</span>
        </div>
        <div className="stat stat-doge">
          <span className="stat-title">{totalStaked?.gt(0) ? tokenAmtToShortString(rewardPerSecond?.mul(86400).mul(combinedStakedBalance ?? 0).div(totalStaked),8,2) : "0.00"}</span>
          <span className="stat-content">Dogecoin Per Day</span>
        </div>
        <div className="stat stat-doge">
          <span className="stat-title">{tokenAmtToShortString(accDogeBal,8,2)}</span>
          <span className="stat-content">Dogecoin Held</span>
        </div>
        <div className="stat stat-doge-small">
          <span className="stat-title">{tokenAmtToShortString(pendingReward ?? 0,8,2)}</span>
          <span className="stat-content">Pending Dogecoin Reward</span>
          <button className='button is-rounded mt-1 is-small is-dark' style={{maxWidth:"10em", position:"absolute",bottom:"-1.5em", right:"0em",backgroundColor:"rgba(0,10,40,1)",border:"solid #126a85 2px"}}
            onClick={()=>sendClaim()}
          >Manual Claim</button>
        </div>
        <div className="stat stat-dgod">
          <span className="stat-title">{weiToShortString(accDgodBal,2)}</span>
          <span className="stat-content">DogeGod Held</span>
        </div>
        {accountDggInitial?.gt(0) && (<>
          <div className="stat stat-dgod-small">
            <span className="stat-title">{weiToShortString(accountVestBal,2)}</span>
            <span className="stat-content">DogeGod Vesting</span>
          </div>
          <div className="stat stat-dgod-small">
            <span className="stat-title">{accountDggClaimable?.gt(0) ? "AVAILABLE" : (deltaCountdown(currentEpoch,firstUnlockEpoch.gt(currentEpoch) ?  firstUnlockEpoch : secondUnlockEpoch))}</span>
            <span className="stat-content">Next Vesting Unlock</span>
            {accountDggClaimable?.gt(0) && (<>
              <button className='button is-rounded mt-1 is-small is-dark' style={{maxWidth:"10em", position:"absolute",bottom:"-1.5em", right:"0em",backgroundColor:"rgba(0,10,40,1)",border:"solid #126a85 2px"}}
              onClick={()=>sendWithdraw()}
            >Withdraw</button>
            </>)}            
          </div>        
        </>)}

      </div>
      </>)}
      <br/><br/>
      <div id="dexscreener-embed" className='mt-5'><iframe src={`https://dexscreener.com/bsc/${ADDRESS_DGODCZUSD_PAIR}?embed=1&theme=dark&info=0`}></iframe></div>
      </div>
    </section>
    
    <Footer />
    
  </>);
}

export default Home
