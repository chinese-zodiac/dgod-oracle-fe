import React, { useEffect, useState } from 'react'
import { useEthers, BSC  } from '@usedapp/core'
import MetamaskLogo from '../../public/static/assets/images/metamask.svg';
import WalletConnectLogo from '../../public/static/assets/images/walletconnect.svg';
import { WalletConnectV2Connector } from '@usedapp/wallet-connect-v2-connector'

const INJECTED_STATE = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  NONE: 'NONE'
};

const Web3ModalButton = ({className}) => {
  const { account, activate, activateBrowserWallet, deactivate, chainId } = useEthers();

  const [injectedState,setInjectedState] = useState(INJECTED_STATE.PENDING);

  const [activateError, setActivateError] = useState('');
  const { error } = useEthers();
  const [isLoadingWalletConnect, setIsLoadingWalletConnect] = useState(false);

  useEffect(()=>{
    if(!!window?.ethereum?.networkVersion || !!window?.web3) {
      setInjectedState(INJECTED_STATE.ACTIVE);
    } else {
      setInjectedState(INJECTED_STATE.NONE);
    }
  },[])

  useEffect(() => {
    if (error) {
      console.log(error);
      setActivateError(error.message)
    }
  }, [error])

  const activateProvider = async (providerId: string) => {
    setIsLoadingWalletConnect(true);
    try {
      deactivate();
      if(providerId == 'injected') {
        activateBrowserWallet();
      } else {
        await activate(new WalletConnectV2Connector({
          projectId: '237f7da7013dfa23795692a295ae5f36',
          chains: [BSC],
          rpcMap:{
            56:'https://rpc.ankr.com/bsc'
          }
        }))
      }
      setActivateError('')
    } catch (error: any) {
      setActivateError(error.message)
    }
    setIsLoadingWalletConnect(false);
  }

  return (
    <div className={"field has-addons is-justify-content-center "+className}>
    {!account ? (<>
    {(injectedState == INJECTED_STATE.ACTIVE) && (<>
      <p className="control">
        <button title="Connect your browser wallet" className="button is-dark is-rounded is-large" style={{width:"6em", backgroundColor:"rgba(0,10,40,0.8)",border:"solid #126a85 2px"}} onClick={()=>activateProvider("injected")} >
          <span className="icon is-small p-1" >
            <img src={MetamaskLogo} />
          </span>
        </button>
      </p>
      <p className="control">
        <button title="Connect with WalletConnect" className="button is-dark is-rounded is-large" style={{width:"6em", backgroundColor:"rgba(0,10,40,0.8)",border:"solid #126a85 2px"}} onClick={()=>activateProvider("walletconnect")}>
          <span className="icon is-small">
            <img src={WalletConnectLogo} />
          </span>
        </button>
      </p>    
    </>)}
    {(injectedState == INJECTED_STATE.NONE) && (<>
      <p className="control">
        <button title="Connect with WalletConnect" className="button is-dark is-rounded is-large" style={{width:"12em", backgroundColor:"rgba(0,10,40,0.8)",border:"solid #126a85 2px"}} onClick={()=>activateProvider("walletconnect")}>
          <span className="icon is-small">
            <img src={WalletConnectLogo} />
          </span>
        </button>
      </p>    
    </>)}
    {(injectedState == INJECTED_STATE.PENDING) && (<>
      <p className="control">
        <button title="Connect with WalletConnect" className="button is-dark is-rounded is-large" style={{width:"12em", backgroundColor:"rgba(0,10,40,0.8)",border:"solid #126a85 2px"}} onClick={()=>activateProvider("walletconnect")}>
            <span className='is-size-6'>ORACLE: <span className='has-text-warning'>CONNECTING...</span></span>
        </button>
      </p>  
    </>)}
    </>) : (<>
    <p className="control">
      <button title="Disconnect your wallet" className="button is-dark is-rounded is-large" style={{width:"12em", backgroundColor:"rgba(0,10,40,0.8)",border:"solid #126a85 2px"}} onClick={() => {console.log("deactivate"); deactivate();}}>
        <span className='is-size-6'>ORACLE: {!!chainId ? <span className='has-text-success'>OK</span> : <span className='has-text-danger'>WRONG NETWORK</span>}</span>
      </button>
    </p></>

    )}
  </div>
  )
}

export default Web3ModalButton;