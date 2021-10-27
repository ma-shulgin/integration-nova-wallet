// import BN from 'bn.js'
// import {AccumulatedReward, ErrorEvent, HistoryElement, Reward, StakeChange} from '../generated/model';
// import {
//     SubstrateBlock,
//     SubstrateEvent,
//     SubstrateExtrinsic,
//     EventContext,
//     StoreContext,
//     DatabaseManager
// } from "@subsquid/hydra-common";
// import {
//     callsFromBatch,
//     eventIdFromBlockAndIdx,
//     isBatch,
//     timestamp,
//     eventId,
//     isProxy, 
//     callFromProxy
// } from "./helpers/common";
// import {CallBase} from "@polkadot/types/types/calls";
// import {AnyTuple} from "@polkadot/types/types/codec";
// import {EraIndex, RewardDestination} from "@polkadot/types/interfaces/staking"
// import {Balance} from "@polkadot/types/interfaces";
// import {handleRewardRestakeForAnalytics, handleSlashForAnalytics} from "./StakeChanged"
// import {cachedRewardDestination} from "./helpers/Cache"
// import { getOrCreate } from './helpers/helpers';
// import { apiService } from './helpers/api';
// // import {cachedRewardDestination, cachedController} from "./helpers/Cache"

// function isPayoutStakers(call: CallBase<AnyTuple>): boolean {
//     return call.method == "payoutStakers"
// }

// function isPayoutValidator(call: CallBase<AnyTuple>): boolean {
//     return call.method == "payoutValidator"
// }

// function extractArgsFromPayoutStakers(call: CallBase<AnyTuple>): [string, number] {
//     const [validatorAddressRaw, eraRaw] = call.args

//     return [validatorAddressRaw.toString(), (eraRaw as EraIndex).toNumber()]
// }

// function extractArgsFromPayoutValidator(call: CallBase<AnyTuple>, sender: string): [string, number] {
//     const [eraRaw] = call.args

//     return [sender, (eraRaw as EraIndex).toNumber()]
// }

// export async function handleRewarded({
//     store,
//     event,
//     block,
//     extrinsic,
//   }: EventContext & StoreContext): Promise<void> {
//     await handleReward({
//         store,
//         event,
//         block,
//         extrinsic,
//       })
// }

// export async function handleReward({
//     store,
//     event,
//     block,
//     extrinsic,
//   }: EventContext & StoreContext): Promise<void> {
//     await handleRewardRestakeForAnalytics({
//         store,
//         event,
//         block,
//         extrinsic,
//       })
//     await handleRewardForTxHistory({
//         store,
//         event,
//         block,
//         extrinsic,
//       })
//     await updateAccumulatedReward(event,store, true)
//     let rewardEventId = eventId(event)
//     try {
//         // let errorOccursOnEvent = await ErrorEvent.get(rewardEventId)
//         let errorOccursOnEvent =  await store.find(ErrorEvent, // recheck
//             {
//               where: {id:rewardEventId}
//             });
//         if (errorOccursOnEvent.length !== 0) {
//             console.info(`Skip rewardEvent: ${rewardEventId}`)
//             return;
//         }

//         await handleRewardRestakeForAnalytics({
//         store,
//         event,
//         block,
//         extrinsic,
//       })
//         await handleRewardForTxHistory({
//         store,
//         event,
//         block,
//         extrinsic,
//       })
//         await updateAccumulatedReward(event,store, true)
//     } catch (error) {
//         console.error(`Got error on reward event: ${rewardEventId}: ${error}`)
//         let saveError =  await getOrCreate(
//             store,
//             ErrorEvent,
//             rewardEventId
//           );
//         saveError.description = JSON.stringify(error)
//         await store.save(saveError)
//     }
// }

// async function handleRewardForTxHistory({
//     store,
//     event,
//     block,
//     extrinsic,
//   }: EventContext & StoreContext): Promise<void> {
//     // let element = await HistoryElement.get(eventId(event)) // recheck
//     let element = undefined
//     if (element !== undefined) {
//         // already processed reward previously
//         return;
//     }

//     let payoutCallsArgs = block.extrinsics
//         .map(extrinsic => determinePayoutCallsArgs(extrinsic.method, extrinsic.signer.toString()))
//         .filter(args => args.length != 0)
//         .flat()

//     if (payoutCallsArgs.length == 0) {
//         return
//     }

//     const payoutValidators = payoutCallsArgs.map(([validator,]) => validator)

//     const initialCallIndex = -1

//     var accountsMapping: {[address: string]: string} = {}

//     for (const eventRecord of rewardEvent.block.events) {
//         if (
//             eventRecord.event.section == rewardEvent.event.section && 
//             eventRecord.event.method == rewardEvent.event.method) {

//             let {event: {data: [account, _]}} = eventRecord

//             let accountAddress = account.toString()
//             let rewardDestination = await cachedRewardDestination(accountAddress, eventRecord as SubstrateEvent)

//             if (rewardDestination.isStaked || rewardDestination.isStash) {
//                 accountsMapping[accountAddress] = accountAddress
//             } else if (rewardDestination.isController) {
//                 accountsMapping[accountAddress] = await cachedController(accountAddress, eventRecord as SubstrateEvent)
//             } else if (rewardDestination.isAccount) {
//                 accountsMapping[accountAddress] = rewardDestination.asAccount.toString()
//             }
//         }
//     }

//     await buildRewardEvents(
//         rewardEvent.block,
//         rewardEvent.extrinsic,
//         rewardEvent.event.method,
//         rewardEvent.event.section,
//         accountsMapping,
//         initialCallIndex,
//         (currentCallIndex, eventAccount) => {
//             if (payoutValidators.length > currentCallIndex + 1) {
//                 return payoutValidators[currentCallIndex + 1] == eventAccount ? currentCallIndex + 1 : currentCallIndex
//             } else {
//                 return currentCallIndex
//             }
//         },
//         (currentCallIndex, eventIdx, stash, amount) => {
//             if (currentCallIndex == -1) {
//                 return {
//                     eventIdx: eventIdx,
//                     amount: amount,
//                     isReward: true,
//                     stash: stash,
//                     validator: "",
//                     era: -1
//                 }
//             } else {
//                 const [validator, era] = payoutCallsArgs[currentCallIndex]
//                 return {
//                     eventIdx: eventIdx,
//                     amount: amount,
//                     isReward: true,
//                     stash: stash,
//                     validator: validator,
//                     era: era
//                 }
//             }
//         }
//     )
// }

// function determinePayoutCallsArgs(causeCall: CallBase<AnyTuple>, sender: string) : [string, number][] {
//     if (isPayoutStakers(causeCall)) {
//         return [extractArgsFromPayoutStakers(causeCall)]
//     } else if (isPayoutValidator(causeCall)) {
//         return [extractArgsFromPayoutValidator(causeCall, sender)]
//     } else if (isBatch(causeCall)) {
//         return callsFromBatch(causeCall)
//             .map(call => {
//                 return determinePayoutCallsArgs(call, sender)
//                     .map((value, index, array) => {
//                         return value
//                     })
//             })
//             .flat()
//     } else if (isProxy(causeCall)) {
//         let proxyCall = callFromProxy(causeCall)
//         return determinePayoutCallsArgs(proxyCall, sender)
//     } else {
//         return []
//     }
// }

// export async function handleSlashed({
//     store,
//     event,
//     block,
//     extrinsic,
//   }: EventContext & StoreContext): Promise<void> {
//     await handleSlash({
//         store,
//         event,
//         block,
//         extrinsic,
//       })
// }

// export async function handleSlash({
//     store,
//     event,
//     block,
//     extrinsic,
//   }: EventContext & StoreContext): Promise<void> {
//     await handleSlashForAnalytics({
//         store,
//         event,
//         block,
//         extrinsic,
//       })
//     await handleSlashForTxHistory({
//         store,
//         event,
//         block,
//         extrinsic,
//       })
//     await updateAccumulatedReward(event,store, false)
//     // let slashEventId = eventId(slashEvent)
//     // try {
//     //     let errorOccursOnEvent = await ErrorEvent.get(slashEventId)
//     //     if (errorOccursOnEvent !== undefined) {
//     //         logger.info(`Skip slashEvent: ${slashEventId}`)
//     //         return;
//     //     }

//     //     await handleSlashForAnalytics(slashEvent)
//     //     await handleSlashForTxHistory(slashEvent)
//     //     await updateAccumulatedReward(slashEvent, false)
//     // } catch (error) {
//     //     logger.error(`Got error on slash event: ${slashEventId}: ${error.toString()}`)
//     //     let saveError = new ErrorEvent(slashEventId)
//     //     saveError.description = error.toString()
//     //     await saveError.save()
//     // }
// }

// async function handleSlashForTxHistory({
//     store,
//     event,
//     block,
//     extrinsic,
//   }: EventContext & StoreContext): Promise<void> {
//     // let element = await HistoryElement.get(eventId(slashEvent)) // recheck
//     let element = undefined
//     const api = await apiService()

//     if (element !== undefined) {
//         // already processed reward previously
//         return;
//     }

//     const currentEra = (await api.query.staking.currentEra()).unwrap()
//     const slashDeferDuration = api.consts.staking.slashDeferDuration

//     const slashEra = slashDeferDuration == undefined 
//     ? currentEra.toNumber()
//     : currentEra.toNumber() - slashDeferDuration.toNumber()

//     const eraStakersInSlashEra = await api.query.staking.erasStakersClipped.entries(slashEra);
//     const validatorsInSlashEra = eraStakersInSlashEra.map(([key, exposure]:any) => {
//         let [, validatorId] = key.args

//         return validatorId.toString()
//     })
//     const validatorsSet = new Set(validatorsInSlashEra)

//     const initialValidator: string = ""

//     await buildRewardEvents(
//         block,
//         extrinsic,
//         event.method,
//         event.section || '',
//         {},
//         initialValidator,
//         (currentValidator, eventAccount) => {
//             return validatorsSet.has(eventAccount) ? eventAccount : currentValidator
//         },
//         (validator, eventIdx, stash, amount):any => {

//             return {
//                 eventIdx: eventIdx,
//                 amount: amount,
//                 isReward: false,
//                 stash: stash,
//                 validator: validator,
//                 era: slashEra
//             }
//         }
//     )
// }

// async function buildRewardEvents<A>(
//     block: SubstrateBlock,
//     extrinsic: SubstrateExtrinsic | undefined,
//     eventMethod: String,
//     eventSection: String,
//     accountsMapping: {[address: string]: string},
//     initialInnerAccumulator: A,
//     produceNewAccumulator: (currentAccumulator: A, eventAccount: string) => A,
//     produceReward: (currentAccumulator: A, eventIdx: number, stash: string, amount: string) => Reward
// ) {
//     let blockNumber = block.height
//     let blockTimestamp = timestamp(block)

//     const [, savingPromises] = block.events.reduce<[A, Promise<void>[]]>(
//         (accumulator, eventRecord, eventIndex) => {
//             let [innerAccumulator, currentPromises] = accumulator

//             if (!(eventRecord.event.method == eventMethod && eventRecord.event.section == eventSection)) return accumulator

//             let {event: {data: [account, amount]}} = eventRecord

//             const newAccumulator = produceNewAccumulator(innerAccumulator, account.toString())

//             const eventId = eventIdFromBlockAndIdx(blockNumber, eventIndex.toString())

//             const element = new HistoryElement(eventId);

//             element.timestamp = blockTimestamp

//             const accountAddress = account.toString()
//             const destinationAddress = accountsMapping[accountAddress]
//             element.address = destinationAddress != undefined ? destinationAddress : accountAddress

//             element.blockNumber = block.block.header.number.toNumber()
//             if (extrinsic !== undefined) {
//                 element.extrinsicHash = extrinsic.extrinsic.hash.toString()
//                 element.extrinsicIdx = extrinsic.idx
//             }
//             element.reward = produceReward(newAccumulator, eventIndex, accountAddress, amount.toString())

//             currentPromises.push(element.save())

//             return [newAccumulator, currentPromises];
//         }, [initialInnerAccumulator, []])

//     await Promise.allSettled(savingPromises);
// }

// async function updateAccumulatedReward(event: SubstrateEvent,store: DatabaseManager, isReward: boolean): Promise<void> {
//     let {event: {data: [accountId, amount]}} = event
//     let accountAddress = accountId.toString()

//     // let accumulatedReward = await AccumulatedReward.get(accountAddress);
//       let newAccumulatedReward = await getOrCreate(
//         store,
//         StakeChange,
//         eventId(event)
//       );
//         newAccumulatedReward.amount = 0n
//         const newAmount = amount
//         newAccumulatedReward.amount = newAccumulatedReward.amount + (isReward ? newAmount : newAmount * -1n)
//         await store.save(newAccumulatedReward)
// }
