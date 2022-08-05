import {utils, BigNumber} from "ethers";
import {PRICING_LP} from "../constants/pricingLp";
const { formatEther, parseEther } = utils;

export function weiToFixed(bn,decimals) {
    if(!bn) return (0).toFixed(decimals);
    return Number(formatEther(bn)).toFixed(decimals);
}

export function weiToShortString(bn,decimals) {
    if(!bn) return (0).toFixed(decimals);
    if(bn.lt(parseEther("1000"))) return weiToShortStringSmall(bn,18,decimals);
    return toShortString(bn.div(BigNumber.from("10").pow(18)),decimals);
}

export function tokenAmtToShortString(bn,tokenDecimals,decimals) {
    if(!bn) return (0).toFixed(decimals);
    if(bn.lt(BigNumber.from("10").pow(tokenDecimals+3))) return weiToShortStringSmall(bn,tokenDecimals,decimals)
    return toShortString(bn.div(BigNumber.from("10").pow(tokenDecimals)),decimals);
}

export function weiToShortStringSmall(bn,tokenDecimals,decimals) {
    if(!bn) return (0).toFixed(decimals);
    let power = BigNumber.from("10").pow((tokenDecimals));
    if(bn.lt(power)) {
        let num = Number(bn) / Number(power);
        if(num < 10e-7) return (0).toFixed(decimals);;
        return num.toPrecision(decimals);
    }
    let powerPrecision = Math.floor(tokenDecimals/2);
    return (Number(bn.div(BigNumber.from("10").pow((tokenDecimals - powerPrecision)))).toFixed(decimals) / Math.pow(10,powerPrecision)).toFixed(decimals);
}

export function weiToUsdWeiVal(bn,usdPerTokens) {
    if(!bn) return BigNumber.from("0");
    if(!usdPerTokens) return BigNumber.from("0");
    return bn.mul((Number(usdPerTokens)*1e+18).toFixed()).div(BigNumber.from("10").pow("18"))
}

export function toShortString(bn,decimals) {
    if(!bn) return (0).toFixed(decimals);
    if(bn.gte(10**12)) {
        return (Number(bn)/10**12).toFixed(decimals)+"T";
    }
    if(bn.gte(10**9)) {
        return (Number(bn)/10**9).toFixed(decimals)+"B";
    }
    if(bn.gte(10**6)) {
        return (Number(bn)/10**6).toFixed(decimals)+"M";
    }
    if(bn.gte(10**3)) {
        return(Number(bn)/10**3).toFixed(decimals)+"K";
    }
    return Number(bn.mul(10**decimals)).toFixed(decimals);
}

export function weiTolpPricedWeiVal(lpInfos,tokenName,tokenWad,czfPrice,czusdPrice) {
    //TODO: Handle when lp is czusd pair
    let lpAddr = PRICING_LP[tokenName];
    let tokens = lpInfos?.[lpAddr]?.tokens;
    return weiToUsdWeiVal(tokenWad.mul(tokens?.[0]).div(tokens?.[1]),czfPrice);
}