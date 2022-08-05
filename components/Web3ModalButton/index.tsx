import React, { useEffect, useState } from 'react'
import type { ChainId } from '@usedapp/core'
import { useEthers, shortenAddress, useLookupAddress, useEtherBalance, useTokenBalance  } from '@usedapp/core'
import styled from 'styled-components'
import Web3Modal from 'web3modal'
import { AccountModal } from '../AccountModal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { parseEther, formatEther } from '@ethersproject/units'
import { ADDRESS_CZUSD, ADDRESS_BUSD, ADDRESS_USDC, ADDRESS_USDT } from '../../constants/addresses'
import MetamaskLogo from '../../public/static/assets/images/metamask.svg';
import WalletConnectLogo from '../../public/static/assets/images/walletconnect.svg';

const Web3ModalButton = ({className}) => {
  const { account, activate, deactivate, chainId } = useEthers();

  const [activateError, setActivateError] = useState('');
  const { error } = useEthers();
  useEffect(() => {
    if (error) {
      console.log(error);
      setActivateError(error.message)
    }
  }, [error])

  const activateProvider = async (providerId: string) => {
    const providerOptions = {
      injected: {
        display: {
          name: 'Metamask',
          description: 'Connect with the provider in your Browser',
        },
        package: null,
      },
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          bridge: 'https://bridge.walletconnect.org',
          infuraId: 'd8df2cb7844e4a54ab0a782f608749dd',
          rpc: {
            56: "https://rpc.ankr.com/bsc"
          }
        },
      },
    }

    const web3Modal = new Web3Modal({
      providerOptions,
    });
    try {
      const provider = await web3Modal.connectTo(providerId);
      await activate(provider)
      setActivateError('')
    } catch (error: any) {
      setActivateError(error.message)
    }
  }

  return (
    <div className={"field has-addons is-justify-content-center "+className}>
    {!account ? (<>
    <p className="control" >
      <button className="button is-dark is-rounded is-large" style={{width:"6em", backgroundColor:"rgba(50,50,50,0.8)",border:"solid #126a85 2px"}} onClick={()=>activateProvider("injected")} >
        <span className="icon is-small p-1" >
          <img src={MetamaskLogo} alt="Connect your browser wallet" />
        </span>
      </button>
    </p>
    <p className="control">
      <button className="button is-dark is-rounded is-large" style={{width:"6em", backgroundColor:"rgba(50,50,50,0.8)",border:"solid #126a85 2px"}} onClick={()=>activateProvider("walletconnect")}>
        <span className="icon is-small">
          <img src={WalletConnectLogo} title="Connect with WalletConnect" />
        </span>
      </button>
    </p>
    </>) : (<>
    <p className="control">
      <button className="button is-dark is-rounded is-large" style={{width:"12em", backgroundColor:"rgba(50,50,50,0.8)",border:"solid #126a85 2px"}} onClick={() => {console.log("deactivate"); deactivate();}}>
        <span className='is-size-6'>ORACLE: {!!chainId ? <span className='has-text-success'>OK</span> : <span className='has-text-danger'>WRONG NETWORK</span>}</span>
      </button>
    </p></>

    )}
  </div>
  )
}

export default Web3ModalButton;