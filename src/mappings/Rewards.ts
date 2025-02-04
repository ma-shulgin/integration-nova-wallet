import {
    AccumulatedReward,
    Reward,
    AccountHistory,
    RewardItem,
    SlashItem,
  } from "../model/generated";
  import {
    Store,
    EventHandlerContext,
    ExtrinsicHandlerContext,
    SubstrateBlock,
    SubstrateEvent,
    SubstrateExtrinsic,
  } from "@subsquid/substrate-processor";
  import {
      callFromProxy,
      callsFromBatch,
    convertAddress,
    convertAddressToSubstrate,
    eventId,
    isBatch,
    isProxy,
    timestampToDate,
  } from "./helpers/common";
  import { Balance, RewardDestination } from "@polkadot/types/interfaces";
  import {
    handleRewardRestakeForAnalytics,
    handleSlashForAnalytics,
  } from "./StakeChanged";
  import { cachedRewardDestination, cachedController } from "./helpers/Cache";
  import { StakingRewardedEvent, StakingRewardEvent} from "../types/events"
  import { StakingPayoutStakersCall, StakingPayoutNominatorCall, StakingPayoutValidatorCall} from "../types/calls"
  import { allBlockEvents, apiService, allBlockExtrinsics, BlockExtrinisic, BlockEvent } from "./helpers/api";
import { get } from "./helpers/helpers";

function isPayoutStakers(extrinisic: SubstrateExtrinsic): boolean {
    return extrinisic.method == "payoutStakers"
}

function isPayoutValidator(extrinisic: SubstrateExtrinsic): boolean {
    return extrinisic.method == "payoutValidator"
}

// function isPayoutNominator(extrinisic: SubstrateExtrinsic): boolean {
//     return extrinisic.method == "payoutNominator"
// }


// function extractArgsFromPayoutNominators(extrinisic: SubstrateExtrinsic): [string, number] {
//     let params = new Staking.Payout_stakersCall(extrinisic);
//     let era = params.era.toNumber();
//     let validator = params.validator_stash.toString();
//     return [validator, era]
// }

function eventToExtrCtx(ctx: EventHandlerContext, extr_: SubstrateExtrinsic) : ExtrinsicHandlerContext {
    let extrCtx : ExtrinsicHandlerContext = { 
        extrinsic : extr_,
        event : ctx.event,
        store : ctx.store,
        block : ctx.block,
        _chain : ctx._chain
    };
    return extrCtx;
}


function extractArgsFromPayoutStakers(ctx: ExtrinsicHandlerContext): [string, number] {
    let callObj = new StakingPayoutStakersCall(ctx);
    let {validatorStash,era} = callObj.asV1058
    return [validatorStash.toString(), era]
}

function extractArgsFromPayoutValidator(ctx: ExtrinsicHandlerContext, sender: string): [string, number] {
    let callObj = new StakingPayoutValidatorCall(ctx);
    let {era} = callObj.asV1050
    return [sender, era]
}

export async function handleRewarded(ctx : EventHandlerContext ): Promise<void> {
    ctx.event.name = 'staking.Reward';
    await handleReward(ctx);
}

export async function handleReward(ctx: EventHandlerContext ): Promise<void> {
  // keep track of stake changes that is happening
  // for addresses across block
    await handleRewardRestakeForAnalytics(ctx);
    await handleRewardForTxHistory(ctx);
    await updateAccumulatedReward(ctx, true)
    // }
}

async function handleRewardForTxHistory(ctx: EventHandlerContext): Promise<void> {
    
    let { store, event, block, extrinsic} = ctx;
    
    let element = await get(store, AccountHistory, eventId(event))

    if (element !== undefined) {
        // already processed reward previously
        return;
    }
 
    let [allExtrinsics, allEvents] =await Promise.all([
        allBlockExtrinsics(block.height),
        allBlockEvents(block.height)
    ]) 

    // Extracts all validator address from extrinsics in the block in order
    // all payouts starts with a payout call with the validator stash
    // the stash address would be mapped to all the nominees as the validator address


    let payoutCallsArgs = allExtrinsics
        .map(extrinsic => determinePayoutCallsArgs(ctx,extrinsic,convertAddressToSubstrate(extrinsic.signer.toString())))
        .filter(args => args.length != 0)
        .flat()

    if (payoutCallsArgs.length == 0) {
        return
    }

    const payoutValidators = payoutCallsArgs.map(([validator,]) => convertAddressToSubstrate(validator))

    const initialCallIndex = -1

    var accountsMapping: {[address: string]: string} = {}
    let rewardEventCount = 0
    for (const eventRecord of allEvents) {
        if (
            eventRecord.section == event.section && 
            eventRecord.method == event.method) {
            
            ctx.event = eventRecord;
            ctx.event.name == 'staking.Rewarded';
            const [account, amount] = new StakingRewardedEvent(ctx).asV9090;
            let accountAddress = convertAddressToSubstrate(account.toString());
            let rewardDestination = await cachedRewardDestination(
                accountAddress,
                 eventRecord as unknown as SubstrateEvent,
                 block)
            if(rewardDestination === undefined){
                console.log('Rewards destination not found in cache',  ++rewardEventCount)
                const apiAt = await apiService(block.hash)
                rewardDestination =  await apiAt.query.staking.payee(accountAddress) as RewardDestination
            }
            if (rewardDestination.isStaked || rewardDestination.isStash) {
                accountsMapping[accountAddress] = accountAddress
            } else if (rewardDestination?.isController) {
                accountsMapping[accountAddress] = await cachedController(
                    accountAddress,
                     eventRecord as unknown as SubstrateEvent,
                     block)
            } else if (rewardDestination.isAccount) {
                accountsMapping[accountAddress] = convertAddressToSubstrate(rewardDestination.asAccount.toString())
            }
        }
    }

    await buildRewardEvents(
        block,
        ctx,
        extrinsic,
        event.method,
        event.section || '',
        accountsMapping,
        initialCallIndex,
        (currentCallIndex, eventAccount) => {
            if (payoutValidators.length > currentCallIndex + 1) {
                return payoutValidators[currentCallIndex + 1] == eventAccount ? currentCallIndex + 1 : currentCallIndex
            } else {
                return currentCallIndex
            }
        },
        (currentCallIndex, eventIdx, stash, amount) => {
            if (currentCallIndex == -1) {
                return new RewardItem({
                    reward: new Reward({
                    eventIdx: eventIdx,
                    amount: BigInt(amount),
                    stash: stash && convertAddress(stash),
                    validator: "",
                    era: -1
                })})
            } else {
                const [validator, era] = payoutCallsArgs[currentCallIndex]
                return new RewardItem({
                    reward: new Reward({
                    eventIdx: eventIdx,
                    amount:BigInt(amount),
                    stash: stash  && convertAddress(stash),
                    validator: validator  && convertAddress(validator),
                    era: era
                })})
            }
        }
    )
}

function determinePayoutCallsArgs(ctx: EventHandlerContext, causeCall: BlockExtrinisic, sender: string) : [string, number][] {
    let extrCtx = eventToExtrCtx(ctx, causeCall);
    if (isPayoutStakers(causeCall)) {
        return [extractArgsFromPayoutStakers(extrCtx)]
    } else if (isPayoutValidator(causeCall)) {
        return [extractArgsFromPayoutValidator(extrCtx, sender)]
    }
    // else if (isPayoutNominator(causeCall)) {
    //         return [extractArgsFromPayoutValidator(causeCall, sender)]
    // } 
    else if (isBatch(causeCall)) {
        return callsFromBatch(causeCall)
            .map((call:any) => {
                return determinePayoutCallsArgs(ctx,call, sender)
                    .map((value, index, array) => {
                        return value
                    })
            })
            .flat()
    } else if (isProxy(causeCall)) {
        let proxyCall = callFromProxy(causeCall)
        return determinePayoutCallsArgs(ctx,proxyCall, sender)
    } else {
        return []
    }
}

export async function handleSlashed(ctx: EventHandlerContext ): Promise<void> {
    ctx.event.name = 'staking.Slash';
    await handleSlash(ctx);
}

export async function handleSlash(ctx: EventHandlerContext): Promise<void> {
    await handleSlashForAnalytics(ctx)
    await handleSlashForTxHistory(ctx)
    await updateAccumulatedReward(ctx, false)
  
}

async function handleSlashForTxHistory(ctx: EventHandlerContext ): Promise<void> {
    const {
        store,
        event,
        block,
        extrinsic,
      } = ctx;
    let isPresent: Array<AccountHistory> = await store.find(
        AccountHistory, // recheck
        {
          where: { id: eventId(event) },
        }
      );
      if (isPresent.length !== 0) {
        // already processed reward previously
        return;
      }
      const api = await apiService(block.hash)

      let era = ((await api.query.staking.currentEra()).toJSON())
      let currentEra = typeof era === 'number' ? era : -1
      const slashDeferDuration = await api.consts.staking.slashDeferDuration;

    const slashEra = slashDeferDuration == undefined 
    ? currentEra
    : currentEra - (slashDeferDuration && slashDeferDuration.toNumber())

    const eraStakersInSlashEra = api.query.staking.erasStakersClipped 
    ? await api.query.staking.erasStakersClipped.entries(slashEra) : [];
    const validatorsInSlashEra = eraStakersInSlashEra.map(([key, exposure]) => {
        let [, validatorId] = key.args

        return convertAddressToSubstrate(validatorId.toString())
    })
    const validatorsSet = new Set(validatorsInSlashEra)

    const initialValidator: string = ""

    await buildRewardEvents(
        block,
        ctx,
        extrinsic,
        event.method,
        event.section || '',
        {},
        initialValidator,
        (currentValidator, eventAccount) => {
            return validatorsSet.has(eventAccount) ? eventAccount : currentValidator
        },
        (validator, eventIdx, stash, amount) => {

            return new SlashItem({
                slash: new Reward({
                eventIdx: eventIdx,
                amount: BigInt(amount),
                stash:stash && convertAddress(stash),
                validator: validator && convertAddress(validator),
                era: slashEra
            })})
        }
    )
}

async function buildRewardEvents<A>(
    block: SubstrateBlock,
    ctx: EventHandlerContext,
    extrinsic: SubstrateExtrinsic | undefined,
    eventMethod: String,
    eventSection: String,
    accountsMapping: {[address: string]: string},
    initialInnerAccumulator: A,
    produceNewAccumulator: (currentAccumulator: A, eventAccount: string) => A,
    produceReward: (currentAccumulator: A, eventIdx: string, stash: string, amount: string) => any
) {
    const events = await allBlockEvents(block.height)
    events.sort((element1, element2) => element1.id.localeCompare(element2.id))
    const [, savingPromises] = events.reduce<[A, Promise<void>[]]>(
        (accumulator, eventRecord, eventIndex) => {
            let [innerAccumulator, currentPromises] = accumulator

            if (!(eventRecord.method == eventMethod && eventRecord.section == eventSection)) return accumulator
            
            ctx.event = eventRecord;
            ctx.event.name = 'staking.Rewarded'
            const [account, amount] = new StakingRewardedEvent(ctx).asV9090;

            const newAccumulator = produceNewAccumulator(innerAccumulator, convertAddressToSubstrate(account.toString()))

            const id = eventId(eventRecord)

            const element = new AccountHistory({
                id: id
            });

            element.timestamp = timestampToDate(block)

            const accountAddress =convertAddressToSubstrate(account.toString())
            const destinationAddress = accountsMapping[accountAddress]
            element.address = convertAddress(destinationAddress != undefined ? destinationAddress : accountAddress)

            element.blockNumber = block.height
            if (extrinsic !== undefined) {
                element.extrinsicHash = extrinsic?.hash?.toString()
                element.extrinsicIdx = extrinsic?.id
            }
            element.item = produceReward(newAccumulator, id, accountAddress, amount.toString())
            currentPromises.push((async (el) : Promise<void> => {ctx.store.save(el)})(element))

            return [newAccumulator, currentPromises];
        }, [initialInnerAccumulator, []])
    
    await Promise.all(savingPromises).catch(err => console.log(err)) ;
}

async function updateAccumulatedReward(
    ctx: EventHandlerContext,
    isReward: boolean
  ): Promise<void> {
    // For both reward and slash, the params are parsed the same way
    ctx.event.name = 'staking.Rewarded';
    const [accountId, amount] = new StakingRewardedEvent(ctx).asV9090;
    let accountAddress = convertAddress(accountId.toString());
  
    let accumulatedReward = await ctx.store.get(AccumulatedReward, {
      where: { id: accountAddress },
    });
  
    if (accumulatedReward == null) {
      accumulatedReward = new AccumulatedReward({
        id: accountAddress,
      });
      accumulatedReward.amount = BigInt(0);
    }
    const newAmount = amount;
    accumulatedReward.amount =
      accumulatedReward.amount + (isReward ? newAmount : -newAmount);
    await ctx.store.save(accumulatedReward);
  }
  