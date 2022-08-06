import { Contract } from 'ethers';
import {  ADDRESS_DGOD_LOCK, ADDRESS_ZERO} from '../constants/addresses';
import { useCalls } from '@usedapp/core'

import DgodLockAbi from "../abi/DgodLock.json";


function useDgodLock(provider,account) {
  const dgodLockContract = new Contract(ADDRESS_DGOD_LOCK,DgodLockAbi,provider);
  const results = useCalls([
    {
      contract:dgodLockContract,
      method:'firstUnlockEpoch',
      args:[]
    },
    {
      contract:dgodLockContract,
      method:'secondUnlockEpoch',
      args:[]
    },
    {
      contract:dgodLockContract,
      method:'accountDggInitial',
      args:[account ?? ADDRESS_ZERO]
    },
    {
      contract:dgodLockContract,
      method:'vestBalanceOf',
      args:[account ?? ADDRESS_ZERO]
    },
    {
      contract:dgodLockContract,
      method:'accountDggClaimable',
      args:[account ?? ADDRESS_ZERO]
    }
  ]) ?? [];
  return {
    firstUnlockEpoch:results?.[0]?.value?.[0],
    secondUnlockEpoch:results?.[1]?.value?.[0],
    accountDggInitial:results?.[2]?.value?.[0],
    accountVestBal:results?.[3]?.value?.[0],
    accountDggClaimable:results?.[4]?.value?.[0]
  }
}

export default useDgodLock;