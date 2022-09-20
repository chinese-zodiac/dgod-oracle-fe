
import { useState, useEffect } from 'react';
import Web3ModalButton from '../../components/Web3ModalButton';
import Footer from '../../components/Footer';
import "./index.module.scss";
import { useEthers, useToken, useContractFunction, useCall, useTokenBalance, useTokenAllowance, useEtherBalance } from '@usedapp/core'
import { useCoingeckoPrice } from '@usedapp/coingecko';
import { utils, Contract, BigNumber } from 'ethers';
import useAutoRewardPool from "../../hooks/useAutoRewardPool";
import useDgodLock from "../../hooks/useDgodLock";
import useCurrentEpoch from "../../hooks/useCurrentEpoch";
import DgodLogo from '../../public/static/assets/logo.png';
import OracleDogo from '../../public/static/assets/images/oracle-dogo.png';
import DogeLogo from '../../public/static/assets/images/dogecoin-1.png';
import HeaderBanner from '../../public/static/assets/images/headerbanner.png';
import CZCashLogo from '../../public/static/assets/images/czcash.png';
import TopVideo from '../../public/static/assets/vids/bgv3.mp4';
import { shortenAddress } from '@usedapp/core'
import IERC20Abi from "../../abi/IERC20.json";
import DgodAbi from "../../abi/Dgod.json";
import DgodLockAbi from "../../abi/DgodLock.json";
import AutoRewardPoolAbi from "../../abi/AutoRewardPool.json";
import { SOCIAL_TELEGRAM } from '../../constants/social';
import { deltaCountdown } from '../../utils/timeDisplay';
import { weiToShortString, tokenAmtToShortString } from '../../utils/bnDisplay';
import { ADDRESS_TEAM, ADDRESS_MARKETING, ADDRESS_DOGE, ADDRESS_DGOD, ADDRESS_AUTO_REWARD_POOL, ADDRESS_DGOD_LOCK, ADDRESS_DGODCZUSD_PAIR, ADDRESS_CZUSD } from '../../constants/addresses';
import { czCashBuyLink } from '../../utils/dexBuyLink';
import Stat from '../../components/Stat';


const { formatEther, commify, parseEther, Interface } = utils;

const primaryColor = "rgb(161,224,289)"
const secondaryColor = "rgb(232,210,115)"

const DgodInterface = new Interface(DgodAbi);
const CONTRACT_DGOD = new Contract(ADDRESS_DGOD, DgodInterface);

const AutoRewardPoolInterface = new Interface(AutoRewardPoolAbi);
const CONTRACT_AUTO_REWARD_POOL = new Contract(ADDRESS_AUTO_REWARD_POOL, AutoRewardPoolInterface);

const DgodLockInterface = new Interface(DgodLockAbi);
const CONTRACT_DGOD_LOCK = new Contract(ADDRESS_DGOD_LOCK, DgodLockInterface);

const Ierc20Interface = new Interface(IERC20Abi);
const CONTRACT_DOGE = new Contract(ADDRESS_DOGE, Ierc20Interface);
const CONTRACT_DGODCZUSD_PAIR = new Contract(ADDRESS_DGODCZUSD_PAIR, Ierc20Interface);



const displayWad = (wad) => !!wad ? Number(formatEther(wad)).toFixed(2) : "...";

const INITIAL_DGOD_PRICE = "0.000008043";
const INITIAL_DGOD_PRICE_FLOOR = "0.000005002";
const INTIAL_DGOD_SUPPLY = parseEther("10000000000");

function Home() {

  const { account, library, chainId } = useEthers();

  const { state: stateClaim, send: sendClaim } = useContractFunction(
    CONTRACT_AUTO_REWARD_POOL,
    'claim');

  const { state: stateWithdraw, send: sendWithdraw } = useContractFunction(
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
  const autoRewardPoolDogeBal = useTokenBalance(ADDRESS_DOGE, ADDRESS_AUTO_REWARD_POOL);
  const lockedLpTokens = useTokenBalance(ADDRESS_DGODCZUSD_PAIR, ADDRESS_DGOD);
  const czusdPrice = "1.00";
  const dogePrice = useCoingeckoPrice("dogecoin");

  const currentEpoch = useCurrentEpoch();

  const [dgodPrice, setDgodPrice] = useState("0");
  const [dgodMcapWad, setDgodMcapWad] = useState(parseEther("0"));
  const [dgodPriceFloor, setDgodPriceFloor] = useState("0");
  const [dogeTotalPaidWad, setDogeTotalPaidWad] = useState(parseEther("0"));
  const [dgodAprWad, setDgodAprWad] = useState(parseEther("0"));
  const [liqRatioWad, setLiqRatioWad] = useState(parseEther("0"));

  const {
    rewardPerSecond,
    totalRewardsPaid,
    combinedStakedBalance,
    totalRewardsReceived,
    pendingReward,
    isAccountAutoClaim,
    totalStaked,
    timestampLast
  } = useAutoRewardPool(library, account);

  const {
    firstUnlockEpoch,
    secondUnlockEpoch,
    accountDggInitial,
    accountVestBal,
    accountDggClaimable
  } = useDgodLock(library, account);

  useEffect(() => {
    if (!czusdPrice || !lpCzusdBal || !lpDgodBal) {
      setDgodPrice("0");
      return;
    }
    const priceWad = lpCzusdBal.mul(parseEther(czusdPrice)).div(lpDgodBal);
    setDgodPrice(formatEther(priceWad));

  }, [czusdPrice, lpCzusdBal?.toString(), lpDgodBal?.toString()]);

  useEffect(() => {
    if (!dgodPrice || !dgodInfo?.totalSupply || !totalRewardsPaid || !rewardPerSecond || !autoRewardPoolDogeBal || !currentEpoch || !timestampLast) {
      setDgodMcapWad(parseEther("0"));
      setDogeTotalPaidWad(parseEther("0"));
      return;
    }
    const mcapWad = dgodInfo.totalSupply.mul(parseEther(dgodPrice)).div(parseEther("1"));
    setDgodMcapWad(mcapWad);
    const secondsRemaining = timestampLast.add(86400 * 7).sub(currentEpoch);
    const dogePaidUsdWad = totalRewardsPaid.add(autoRewardPoolDogeBal).sub(rewardPerSecond.mul(secondsRemaining));
    setDogeTotalPaidWad(dogePaidUsdWad);
  }, [dgodPrice, dgodInfo?.totalSupply?.toString(), totalRewardsPaid?.toString(), autoRewardPoolDogeBal?.toString(), rewardPerSecond?.toString(), currentEpoch?.toString(), timestampLast?.toString()]);

  useEffect(() => {
    if (!dgodPrice || !totalStaked || !rewardPerSecond || totalStaked?.eq(0) || dgodPrice == 0) {
      setDgodAprWad(parseEther("0"));
      return;
    }
    const stakedUsd = totalStaked.mul(parseEther(dgodPrice)).div(parseEther("1"));
    const usdPerDay = rewardPerSecond.mul(86400 * 365).mul(parseEther(dogePrice ?? "0")).div(10 ** 8);
    console.log({ usdPerDay })
    const apr = usdPerDay?.mul(parseEther("100")).div(stakedUsd) ?? BigNumber.from(0);
    setDgodAprWad(apr);
  }, [dgodPrice, dogePrice, totalStaked?.toString(), rewardPerSecond?.toString()]);

  useEffect(() => {
    if (!lpDgodBal || !dgodInfo?.totalSupply || dgodInfo.totalSupply.eq(0)) {
      setLiqRatioWad(parseEther("0"));
      return;
    }
    const ratio = lpDgodBal.mul(2).mul(parseEther("100")).div(dgodInfo.totalSupply);
    setLiqRatioWad(ratio);

  }, [lpDgodBal?.toString(), dgodInfo?.totalSupply?.toString()]);

  useEffect(() => {
    if (!czusdPrice || !lpDgodBal || !lockedLpTokens || !dgodInfo?.totalSupply || !dgodCzusdPairInfo?.totalSupply) {
      setDgodPriceFloor("0");
      return;
    }
    const lockedInvariant = lpCzusdBal.mul(lpDgodBal).mul(lockedLpTokens).div(dgodCzusdPairInfo.totalSupply);
    const lpCzusdBalAfterMaxSell = lockedInvariant.div(dgodInfo.totalSupply);
    const priceWad = lpCzusdBalAfterMaxSell.mul(parseEther(czusdPrice)).div(dgodInfo.totalSupply);
    setDgodPriceFloor(formatEther(priceWad));

  }, [czusdPrice, lpCzusdBal?.toString(), lpDgodBal?.toString(), lockedLpTokens?.toString(), dgodInfo?.totalSupply?.toString(), dgodCzusdPairInfo?.totalSupply?.toString()]);


  return (<>
    <section id="top" className="hero has-text-centered">
      <div className="m-0 p-0" style={{ position: "relative", width: "100%", height: "7.5em" }}>
        <div style={{ position: "absolute", width: "100vw", height: "7.5em", overflow: "hidden" }}>
          <video poster={HeaderBanner} preload="none" autoPlay loop muted style={{ display: "inline-block", objectFit: "cover", objectPosition: "center", width: "100vw", minWidth: "1920px", height: "7.5em", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <source src={TopVideo} type="video/mp4" />
          </video>

        </div>

        <Web3ModalButton className="mt-5 mb-5" />
        <p className='has-text-grey-lighter is-size-7 is-dark' style={{ position: "absolute", bottom: "0", left: "0", right: "0", zIndex: "2", backgroundColor: "rgba(0,10,40,0.8)" }}>
          <span className="mr-2 mb-0 is-inline-block has-text-left" style={{ width: "11em" }}>Network: {!!account ? (chainId == 56 ? (<span className="has-text-success">✓ BSC</span>) : <span className="has-text-error has-text-danger">❌NOT BSC</span>) : "..."}</span>
          <span className="mt-0 is-inline-block has-text-left" style={{ width: "11em" }}>Wallet: {!!account ? shortenAddress(account) : "..."}</span>
        </p>
      </div>
      <div className="m-0 " style={{ background: "linear-gradient(301deg, rgba(1,31,23,1) 0%, rgba(5,24,40,1) 100%)", paddingBottom: "5em", paddingTop: "1em" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <a href="https://dogegod.io" target="_blank">
              <img src={DgodLogo} width={110} height={110} alt="DGOD symbol" />
            </a>
            <div>
              ${dgodPrice?.substring(0, 10)}
            </div>
          </div>
          <div>
            <img src={OracleDogo} width={2904 / 15} height={2804 / 15} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <a target="_blank" href="https://dogecoin.com">
              <img src={DogeLogo} height={110} width={110} alt="Dogecoin" />
            </a>
            <div>
              ${dogePrice}
            </div>
          </div>
        </div>
        {/* <p>Contract address</p>
        <p>Contract address</p> */}
        <br />
        {/* BUY BUTTON LINK */}
        <a target="_blank" href={czCashBuyLink(ADDRESS_DGOD)} className="button is-dark is-outlined is-large mt-0 mb-5 is-rounded" style={{ display: "block", width: "12em", border: "solid #126a85 2px", color: "white", marginLeft: "auto", marginRight: "auto", paddingTop: "0.45em" }} >
          BUY ON
          <img src={CZCashLogo} style={{ height: "1em", marginLeft: "0.1em", position: "relative", top: "0.1em" }} alt="CZ.Cash" />
        </a>
        {/* Rewards Block */}
        <div className="container is-2" style={{ padding: "0 2em 2em 2em" }}>
          <h3 className="outline-text" style={{ margin: "2rem 0 2rem 0", fontSize: "2rem", fontWeight: 'normal', color: 'white', textTransform: 'uppercase', whiteSpace: "pre-line" }}>
            Your <span style={{ color: secondaryColor }}>Wallet</span>{"\n"}
            {account && <span className="is-size-5 is-block" style={{ marginTop: "-0.25em", textTransform: "none" }}>{shortenAddress(account)}</span>}
          </h3>
          {account && <button
            className="button is-dark"
            style={{
              border: "1px solid " + primaryColor,
              textTransform: "uppercase",
              backgroundColor: "#045F87"
            }}
            onClick={() => sendClaim()}
          >
            Claim Pending
          </button>}
          {account ?
            <div className="columns" style={{ border: "3px solid rgb(237, 209, 98)", backgroundColor: 'rgba(97, 89, 57, 0.4)', borderRadius: '1em', padding: "1.5em 1.5em 1.5em 1.5em", justifyContent: 'space-evenly' }}>
              <Stat
                color={primaryColor}
                title="Earned"
                primaryText={`${commify(formatEther((totalRewardsReceived ?? BigNumber.from("0")).mul(10 ** 10)))}\nDOGE`}
                secondaryText={`$ ${commify((parseFloat(formatEther((totalRewardsReceived ?? BigNumber.from("0")).mul(10 ** 10))) * (dogePrice ?? 0)).toFixed(2))}`}
              />
              <Stat
                color={primaryColor}
                title="Per Day"
                primaryText={`${commify(formatEther((rewardPerSecond?.mul(86400).mul(combinedStakedBalance ?? 0).div(totalStaked)).mul(10 ** 10)))}\nDOGE`}
                secondaryText={`$ ${commify((parseFloat(formatEther((rewardPerSecond?.mul(86400).mul(combinedStakedBalance ?? 0).div(totalStaked)).mul(10 ** 10))) * (dogePrice ?? 0)).toFixed(2))}`}
              />
              <Stat
                color={secondaryColor}
                title="Held"
                primaryText={`${commify(formatEther((accDogeBal ?? BigNumber.from("0")).mul(10 ** 10)))}\nDOGE`}
                secondaryText={`$ ${commify((parseFloat(formatEther((accDogeBal ?? BigNumber.from("0")).mul(10 ** 10))) * (dogePrice ?? 0)).toFixed(2))}`}
              />
              <Stat
                color={secondaryColor}
                title="Pending"
                primaryText={`${commify(formatEther((pendingReward ?? BigNumber.from("0")).mul(10 ** 10)))}\nDOGE`}
                secondaryText={`$ ${commify((parseFloat(formatEther((pendingReward ?? BigNumber.from("0")).mul(10 ** 10))) * (dogePrice ?? 0)).toFixed(2))}`}
              />
              <Stat
                color={primaryColor}
                title="DGOD Held"
                primaryText={`${commify(parseFloat(formatEther(accDgodBal ?? BigNumber.from("0"))).toFixed(2))}\nDGOD`}
                secondaryText={`$ ${commify((parseFloat(formatEther(accDgodBal ?? BigNumber.from("0"))) * (dgodPrice ?? 0)).toFixed(2))}`}
              />
            </div>
            : <button
              className="px-6 py-3 button is-dark"
              style={{
                border: "2px solid rgb(18, 106, 133)",
                color: "white",
                fontSize: "1.5rem",
                textTransform: "uppercase",
                borderRadius: "2em",
              }}

              onClick={e => window.scrollTo({ top: 0, behaviour: "smooth" })}
            >
              Connect on top
            </button>}
          <h3 className="outline-text" style={{ margin: "2rem 0 2rem 0", fontSize: "2rem", fontWeight: 'bold', color: secondaryColor, }}>
            Rewards
          </h3>
          <div className="columns" style={{ border: "3px solid rgb(237, 209, 98)", backgroundColor: 'rgba(97, 89, 57, 0.4)', borderRadius: '1em', padding: "1.5em 1.5em 1.5em 1.5em", justifyContent: 'space-evenly' }}>
            <Stat
              color={secondaryColor}
              title="Accumulated"
              primaryText={`${commify(formatEther((dogeTotalPaidWad ?? BigNumber.from("0")).mul(10 ** 10)))} DOGE`}
              secondaryText={`$ ${commify((parseFloat(formatEther((dogeTotalPaidWad ?? BigNumber.from("0")).mul(10 ** 10))) * (dogePrice ?? 0)).toFixed(2))}`}
            />
            <Stat
              color={secondaryColor}
              title="Distributed"
              primaryText={`${commify(formatEther((totalRewardsPaid ?? BigNumber.from("0")).mul(10 ** 10)))} DOGE`}
              secondaryText={`$ ${commify((parseFloat(formatEther((totalRewardsPaid ?? BigNumber.from("0")).mul(10 ** 10))) * (dogePrice ?? 0)).toFixed(2))}`}
            />
            <Stat
              color={secondaryColor}
              title="Today"
              primaryText={`${commify(formatEther((rewardPerSecond ?? BigNumber.from("0"))?.mul(86400).mul(10 ** 10)))} DOGE`}
              secondaryText={`$ ${commify((parseFloat(formatEther((rewardPerSecond ?? BigNumber.from("0")).mul(86400).mul(10 ** 10))) * (dogePrice ?? 0)).toFixed(2))}`}
            />
          </div>
          <h3 className="outline-text" style={{ margin: "2rem 0 2rem 0", fontSize: "2rem", fontWeight: 'bold', color: primaryColor, }}>
            DogeGod Stats
          </h3>
          <div className="columns" style={{ border: "3px solid rgb(161, 224, 189)", backgroundColor: "rgb(42, 67, 50)", borderRadius: '1em', padding: "1.5em 1.5em 1.5em 1.5em" }}>
            <Stat
              color={secondaryColor}
              title="Market Cap"
              primaryText={`$ ${commify(formatEther(dgodMcapWad)).split(".")[0]}`}
            />
            <Stat
              color={secondaryColor}
              title="Price DGOD"
              primaryText={`$ ${commify(dgodPrice?.substring(0, 10))}`}
            />
            <Stat
              color={secondaryColor}
              title="Price % Diff"
              primaryText={`${weiToShortString(parseEther("100").mul(parseEther(dgodPrice)).div(parseEther(INITIAL_DGOD_PRICE)).sub(parseEther("100")), 2)} %`}
            />
            <Stat
              color={secondaryColor}
              title="Floor Price"
              primaryText={`$ ${dgodPriceFloor?.substring(0, 10)}`}
            />
            <Stat
              color={secondaryColor}
              title="Floor % Diff"
              primaryText={`${weiToShortString(parseEther("100").mul(parseEther(dgodPriceFloor)).div(parseEther(INITIAL_DGOD_PRICE_FLOOR)).sub(parseEther("100")), 2)} %`}
            />
          </div>
          <h3 className="outline-text" style={{ margin: "2rem 0 2rem 0", fontSize: "2rem", fontWeight: 'bold', color: primaryColor, }}>
            DogeGod Performance
          </h3>
          <div className="columns" style={{ border: "3px solid rgb(161, 224, 189)", backgroundColor: "rgb(42, 67, 50)", borderRadius: '1em', padding: "1.5em 1.5em 1.5em 1.5em" }}>
            <Stat
              color={secondaryColor}
              title="Marketing"
              primaryText={`${commify(formatEther((marketingDogeBal ?? BigNumber.from("0")).mul(10 ** 10))).split(".")[0]} DOGE`}
              secondaryText={`$ ${commify((parseFloat(formatEther((marketingDogeBal ?? BigNumber.from("0")).mul(10 ** 10))) * (dogePrice ?? 0)).toFixed(2))}`}
            />
            <Stat
              color={secondaryColor}
              title="Burned"
              primaryText={`${commify(formatEther(INTIAL_DGOD_SUPPLY.sub(dgodInfo?.totalSupply ?? INTIAL_DGOD_SUPPLY)).split(".")[0])} DGOD`}
              secondaryText={`$ ${commify((parseFloat(formatEther(INTIAL_DGOD_SUPPLY.sub(dgodInfo?.totalSupply ?? INTIAL_DGOD_SUPPLY))) * (dogePrice ?? 0)).toFixed(2))}`}
            />
            <Stat
              color={secondaryColor}
              title="APR"
              primaryText={`${weiToShortString(dgodAprWad, 2)} %`}
            />
            <Stat
              color={secondaryColor}
              title="Liquidity %"
              primaryText={`${weiToShortString(liqRatioWad, 2)} %`}
              secondaryText={`of MCAP`}
            />
          </div>
        </div>
        {/* <div className="columns is-centered is-vcentered is-multiline pl-2 pr-2 mb-5">
          <div className="stat stat-doge">
            <span className="stat-title">{tokenAmtToShortString(dogeTotalPaidWad ?? 0, 8, 6)}</span>
            <span className="stat-content">Total Dogecoin Rewards</span>
          </div>
          <div className="stat stat-doge">
            <span className="stat-title">{tokenAmtToShortString(totalRewardsPaid ?? 0, 8, 2)}</span>
            <span className="stat-content">Total Dogecoin Distributed</span>
          </div>
          <div className="stat stat-doge-small">
            <span className="stat-title">{tokenAmtToShortString(rewardPerSecond?.mul(86400) ?? 0, 8, 2)}</span>
            <span className="stat-content">Dogecoin Rewards Today</span>
          </div>
          <div className="stat stat-doge-small">
            <span className="stat-title">{tokenAmtToShortString(marketingDogeBal ?? 0, 8, 2)}</span>
            <span className="stat-content">Total Marketing</span>
          </div>
          <div className="stat stat-dgod">
            <span className="stat-title">${dgodPrice?.substring(0, 10)}</span>
            <span className="stat-content">DogeGod Price</span>
          </div>
          <div className="stat stat-dgod">
            <span className="stat-title">+{weiToShortString(parseEther("100").mul(parseEther(dgodPrice)).div(parseEther(INITIAL_DGOD_PRICE)).sub(parseEther("100")), 2)}%</span>
            <span className="stat-content">DogeGod % Increase</span>
          </div>
          <div className="stat stat-dgod">
            <span className="stat-title">${dgodPriceFloor?.substring(0, 10)}</span>
            <span className="stat-content">DogeGod Floor Price</span>
          </div>
          <div className="stat stat-dgod">
            <span className="stat-title">+{weiToShortString(parseEther("100").mul(parseEther(dgodPriceFloor)).div(parseEther(INITIAL_DGOD_PRICE_FLOOR)).sub(parseEther("100")), 2)}%</span>
            <span className="stat-content">Floor % Increase</span>
          </div>
          <div className="stat stat-dgod-small">
            <span className="stat-title">${weiToShortString(weiToUsdWeiVal(INTIAL_DGOD_SUPPLY.sub(dgodInfo?.totalSupply ?? INTIAL_DGOD_SUPPLY), dgodPrice), 2)}</span>
            <span className="stat-content">Total DogeGod Burned</span>
          </div>
          <div className="stat stat-dgod-small">
            <span className="stat-title">TBD</span>
            <span className="stat-content">DogeGod Burned Today</span>
          </div>
          <div className="stat stat-dgod-small">
            <span className="stat-title">{weiToShortString(dgodAprWad, 2)}%</span>
            <span className="stat-content">DogeGod APR</span>
          </div>
          <div className="stat stat-dgod-small">
            <span className="stat-title">${weiToShortString(dgodMcapWad, 2)}</span>
            <span className="stat-content">DogeGod MCAP</span>
          </div>
          <div className="stat stat-dgod-small">
            <span className="stat-title">{weiToShortString(liqRatioWad, 2)}%</span>
            <span className="stat-content">Liquidity % of MCAP</span>
          </div>
        </div> */}
        {/* <h3 className="is-size-3 m-3 mt-5">
            YOUR <span style={{color:"#FFCB16"}}>WALLET</span>
            {!!account ? (
              <span className="is-size-5 is-block" style={{marginTop:"-0.25em"}}>{shortenAddress(account)}</span>
            ) : (<>
              <a className="is-size-5 is-block" style={{marginTop:"-0.25em",textDecoration:"underline",color:"white"}} href="#top">Connect your wallet at top</a>
              <a className="is-size-5 is-block" target="_blank" style={{textDecoration:"underline"}} href={SOCIAL_TELEGRAM}>Need help? Ask on Telegram</a>
            </>)

            }
            
          </h3> */}
        {!!account && (<>
          <div className="columns is-vcentered is-centered is-multiline pl-5 pr-5 mb-5">
            {/* <div className="stat stat-doge">
              <span className="stat-title">{tokenAmtToShortString(totalRewardsReceived, 8, 2)}</span>
              <span className="stat-content">Total Dogecoin Earned</span>
            </div>
            <div className="stat stat-doge">
              <span className="stat-title">{totalStaked?.gt(0) ? tokenAmtToShortString(rewardPerSecond?.mul(86400).mul(combinedStakedBalance ?? 0).div(totalStaked), 8, 2) : "0.00"}</span>
              <span className="stat-content">Dogecoin Per Day</span>
            </div>
            <div className="stat stat-doge">
              <span className="stat-title">{tokenAmtToShortString(accDogeBal, 8, 2)}</span>
              <span className="stat-content">Dogecoin Held</span>
            </div>
            <div className="stat stat-doge-small">
              <span className="stat-title">{tokenAmtToShortString(pendingReward ?? 0, 8, 2)}</span>
              <span className="stat-content">Pending Dogecoin Reward</span>
              <button className='button is-rounded mt-1 is-small is-dark' style={{ maxWidth: "10em", position: "absolute", bottom: "-1.5em", right: "0em", backgroundColor: "rgba(0,10,40,1)", border: "solid #126a85 2px" }}
                onClick={() => sendClaim()}
              >Manual Claim</button>
            </div>
            <div className="stat stat-dgod">
              <span className="stat-title">{weiToShortString(accDgodBal, 2)}</span>
              <span className="stat-content">DogeGod Held</span>
            </div> */}
            {accountDggInitial?.gt(0) && (<>
              <div className="stat stat-dgod-small">
                <span className="stat-title">{weiToShortString(accountVestBal, 2)}</span>
                <span className="stat-content">DogeGod Vesting</span>
              </div>
              <div className="stat stat-dgod-small">
                <span className="stat-title">{accountDggClaimable?.gt(0) ? "AVAILABLE" : (deltaCountdown(currentEpoch, firstUnlockEpoch.gt(currentEpoch) ? firstUnlockEpoch : secondUnlockEpoch))}</span>
                <span className="stat-content">Next Vesting Unlock</span>
                {accountDggClaimable?.gt(0) && (<>
                  <button className='button is-rounded mt-1 is-small is-dark' style={{ maxWidth: "10em", position: "absolute", bottom: "-1.5em", right: "0em", backgroundColor: "rgba(0,10,40,1)", border: "solid #126a85 2px" }}
                    onClick={() => sendWithdraw()}
                  >Withdraw</button>
                </>)}
              </div>
            </>)}

          </div>
        </>)}
        <br /><br />
        {/*
        <div id="dexscreener-embed" className='mt-5'><iframe src={`https://dexscreener.com/bsc/${ADDRESS_DGODCZUSD_PAIR}?embed=1&theme=dark&info=0`}></iframe></div>
        */}
      </div>
    </section>

    <Footer />

  </>);
}

export default Home
