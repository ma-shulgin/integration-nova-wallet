import {EventHandlerContext,  Store} from '@subsquid/substrate-processor'
import {AccumulatedStake, StakeChange} from '../model/generated';
import { getOrCreate } from './helpers/helpers';
import { convertAddress, convertAddressToSubstrate, eventId, timestamp} from "./helpers/common";
import {Balance} from "@polkadot/types/interfaces";
import { StakingRewardEvent, StakingRewardedEvent, StakingBondedEvent, StakingUnbondedEvent, StakingSlashedEvent, StakingSlashEvent } from '../types/events';
import { cachedRewardDestination } from './helpers/Cache';

export async function handleBonded(ctx: EventHandlerContext ): Promise<void>{
    
  const {store, event, block}  = ctx
  const typedObj = new StakingBondedEvent(ctx);
  const [stash, amount] = typedObj.asLatest;
    let address = convertAddress(stash.toString())
    let amountBalance = amount
    let accumulatedAmount = await handleAccumulatedStake(address, amountBalance, store)

    const element = await getOrCreate(
        store,
        StakeChange,
        eventId(event)
      );
    if (event.extrinsic !== undefined && event.extrinsic !== null) {
        element.extrinsicHash = event.extrinsic?.hash
    }
    element.blockNumber = block.height
    element.eventIdx = event.id
    element.timestamp = timestamp(block)
    element.address = address
    element.amount = amountBalance
    element.accumulatedAmount = accumulatedAmount
    element.type = "bonded"

    await store.save(element)
}

export async function handleUnbonded(ctx: EventHandlerContext ): Promise<void>{
    
    const {store, event, block}  = ctx
    const typedObj = new StakingUnbondedEvent(ctx);
    const [stash, amount] = typedObj.asLatest;
    let address = convertAddress(stash.toString())
    let amountBalance = amount * -1n // need to subtract
    let accumulatedAmount = await handleAccumulatedStake(address, amountBalance, store)

    const element =await getOrCreate(
      store,
      StakeChange,
      eventId(event)
    );
    if (event.extrinsic !== undefined && event.extrinsic !== null) {
        element.extrinsicHash = event.extrinsic?.hash;
    }
    element.blockNumber = block.height
    element.eventIdx = event.id
    element.timestamp = timestamp(block)
    element.address = address
    element.amount = amountBalance
    element.accumulatedAmount = accumulatedAmount
    element.type = "unbonded"

    await store.save(element)
}

export async function handleSlashForAnalytics(ctx: EventHandlerContext ): Promise<void>{
    
  const {store, event, block}  = ctx
  const typedObj = new StakingSlashEvent(ctx);
  const [validatorOrNominatorAccountId, amount] = typedObj.asLatest;
    let address = convertAddress( validatorOrNominatorAccountId.toString())
    let amountBalance = amount * -1n
    let accumulatedAmount = await handleAccumulatedStake(address, amountBalance, store)

    const element = await getOrCreate(
      store,
      StakeChange,
      eventId(event)
    );
    if (event.extrinsic !== undefined && event.extrinsic !== null) {
        element.extrinsicHash = event.extrinsic?.hash
    }
    element.blockNumber = block.height
    element.eventIdx = event.id
    element.timestamp = timestamp(block)
    element.address =address
    element.amount = amountBalance
    element.accumulatedAmount = accumulatedAmount
    element.type = "slashed"

    await store.save(element)
}

export async function handleRewardRestakeForAnalytics(ctx: EventHandlerContext ): Promise<void>{
  const {store, event, block}  = ctx
  const typedObj = new StakingRewardEvent(ctx);
  if (typedObj.isV1020) return;
  const [accountId, amount] = typedObj.asLatest;
    let accountAddress = accountId.toString()
    const payee = await cachedRewardDestination(convertAddressToSubstrate(accountAddress), event, block)
    if (payee?.isStaked) {
        let amountBalance = amount
        let accumulatedAmount = await handleAccumulatedStake(convertAddress(accountAddress), amountBalance, store)

        const element = await getOrCreate(
          store,
          StakeChange,
          eventId(event)
        );
        if (event.extrinsic !== undefined && event.extrinsic !== null) {
            element.extrinsicHash = event.extrinsic?.hash
        }
        element.blockNumber = block.height
        element.eventIdx = event.id
        element.timestamp = timestamp(block)
        element.address = convertAddress(accountAddress)
        element.amount = amountBalance
        element.accumulatedAmount = accumulatedAmount
        element.type = "rewarded"

        await store.save(element)
    }
}

async function handleAccumulatedStake(address: string, amount: bigint, store:  Store): Promise<bigint> {
    let accumulatedStake =  await store.find(AccumulatedStake, 
        {
          where: {id: address}
        });
    if (accumulatedStake.length !==0) {
        let accumulatedAmount = BigInt(accumulatedStake[0].amount)
        accumulatedAmount += (amount) 
        accumulatedStake[0].amount = accumulatedAmount
        await store.save(accumulatedStake)
        return accumulatedAmount
    } else {
        let accumulatedStake = await getOrCreate(
            store,
            AccumulatedStake,
            address
          );
        accumulatedStake.amount = amount
        store.save(accumulatedStake)
        return amount
    }
}

