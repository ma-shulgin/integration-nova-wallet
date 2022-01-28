import {
  EventHandlerContext,
  SubstrateBlock,
  SubstrateEvent,
  SubstrateExtrinsic,
} from "@subsquid/substrate-processor";

import {  AccountHistory, Transfer, TransferItem } from '../model/generated';
import { BalancesDepositEvent, BalancesTransferEvent } from '../types/events'
import {
  blockNumber,
  calculateFee,
  convertAddress,
  eventId,
  feeEventsToExtrinisicMap,
  timestampToDate,
} from "./helpers/common";
import { getOrCreate } from "./helpers/helpers";
import { BlockExtrinisic } from './helpers/api';
import { ADDRESS_PREFIX } from "../constants";
import { from } from "rxjs";

function getTransferDetails(eventObj:BalancesTransferEvent):{from: string,to: string, amount: bigint} {
  if (eventObj.isV1020) {
    const [fromUA,toUA,amount,] = eventObj.asV1020
    const from = fromUA.toString();
    const to = toUA.toString();
    return {from,to,amount}
  }
  else if (eventObj.isV1050) {
      const [fromUA,toUA,amount] = eventObj.asV1050
      const from = fromUA.toString();
      const to = toUA.toString();
      return {from,to,amount};
  }
  else {
    const res = eventObj.asV9130;
    const from = res.from.toString();
    const to = res.to.toString();
    const amount = res.amount;
    return {from,to, amount};
}
}

export async function handleTransfer( ctx: EventHandlerContext): Promise<void> {
  const {
    store,
    event,
    block,
    extrinsic,
  } = ctx;
  
  const evObj = new BalancesTransferEvent(ctx);
  const {from, to, amount} = getTransferDetails(evObj);

  const elementFrom = await getOrCreate(
    store,
    AccountHistory,
    eventId(event) + `-from`
  );
  elementFrom.address = convertAddress(from.toString());
  await populateTransfer(elementFrom, ctx);

  const elementTo = await getOrCreate(
    store,
    AccountHistory,
    eventId(event) + `-to`
  );
  elementTo.address = convertAddress(to.toString());
  await populateTransfer(elementTo,ctx);
}

// export async function handleTransferKeepAlive({
//   store,
//   event,
//   block,
//   extrinsic,
// }: EventContext): Promise<void> {
//   await handleTransfer({ store, event, block, extrinsic });
// }

async function populateTransfer(
  element: AccountHistory,
  ctx : EventHandlerContext
): Promise<void> {
  const {event, block, extrinsic, store} = ctx;
  element.timestamp = timestampToDate(block);
  element.blockNumber = blockNumber(event);
  if (extrinsic !== undefined && extrinsic !== null) {
    element.extrinsicHash = extrinsic.hash;
    element.extrinsicIdx = extrinsic.id;
  }
  const evObj = new BalancesTransferEvent(ctx);
  const {from, to, amount} = getTransferDetails(evObj);
  const fees = await feeEventsToExtrinisicMap(block.height);
  let transfer: Transfer | undefined = await store.get(Transfer, {
    where: { extrinisicIdx: extrinsic?.id },
  })
  if (transfer == null) {
    transfer = new Transfer()
  }

  if (extrinsic?.id == undefined) {
    console.error(`extrinisic id undefined for transfer with event id = ${event.id}.Skipping it `)
    return
  }
  transfer.amount = amount.toString();
  transfer.from = convertAddress(from.toString());
  transfer.to =  convertAddress(to.toString())
  transfer.fee = calculateFee(extrinsic as BlockExtrinisic,fees);
  transfer.extrinisicIdx = extrinsic?.id;
  transfer.eventIdx = event.id;
  transfer.success = true;
  transfer.id = event.id
  transfer.isTransferKeepAlive = extrinsic.method === 'transferKeepAlive'
  await store.save(transfer);

  element.item = new TransferItem({
    transfer: transfer.id
  })
  await store.save(element);
}
