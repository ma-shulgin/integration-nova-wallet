import assert from 'assert'
import {EventContext, Result, deprecateLatest} from './support'
import * as v1058 from './v1058'
import * as v9130 from './v9130'

export class BalancesDepositEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Deposit')
  }

  /**
   *  Some amount was deposited (e.g. for transaction fees).
   */
  get isV1032(): boolean {
    return this.ctx._chain.getEventHash('balances.Deposit') === 'f51ef257475aaeac42946f50fe382d5b09a9bf43dca39fda2ca4e910eba6aef9'
  }

  /**
   *  Some amount was deposited (e.g. for transaction fees).
   */
  get asV1032(): [Uint8Array, bigint] {
    assert(this.isV1032)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Some amount was deposited (e.g. for transaction fees).
   */
  get isV9130(): boolean {
    return this.ctx._chain.getEventHash('balances.Deposit') === '042054185e0c4221bfb671c8699bcdbefc2f6daba2dddfe3c36a647fd3bf8f88'
  }

  /**
   * Some amount was deposited (e.g. for transaction fees).
   */
  get asV9130(): {who: v9130.AccountId32, amount: bigint} {
    assert(this.isV9130)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV9130
  }

  get asLatest(): {who: v9130.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV9130
  }
}

export class BalancesTransferEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Transfer')
  }

  /**
   *  Transfer succeeded (from, to, value, fees).
   */
  get isV1020(): boolean {
    return this.ctx._chain.getEventHash('balances.Transfer') === 'e1ceec345fa4674275d2608b64d810ecec8e9c26719985db4998568cfcafa72b'
  }

  /**
   *  Transfer succeeded (from, to, value, fees).
   */
  get asV1020(): [Uint8Array, Uint8Array, bigint, bigint] {
    assert(this.isV1020)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   *  Transfer succeeded (from, to, value).
   */
  get isV1050(): boolean {
    return this.ctx._chain.getEventHash('balances.Transfer') === '2082574713e816229f596f97b58d3debbdea4b002607df469a619e037cc11120'
  }

  /**
   *  Transfer succeeded (from, to, value).
   */
  get asV1050(): [Uint8Array, Uint8Array, bigint] {
    assert(this.isV1050)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Transfer succeeded.
   */
  get isV9130(): boolean {
    return this.ctx._chain.getEventHash('balances.Transfer') === '68dcb27fbf3d9279c1115ef6dd9d30a3852b23d8e91c1881acd12563a212512d'
  }

  /**
   * Transfer succeeded.
   */
  get asV9130(): {from: v9130.AccountId32, to: v9130.AccountId32, amount: bigint} {
    assert(this.isV9130)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV9130
  }

  get asLatest(): {from: v9130.AccountId32, to: v9130.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV9130
  }
}

export class StakingBondedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'staking.Bonded')
  }

  /**
   *  An account has bonded this amount.
   * 
   *  NOTE: This event is only emitted when funds are bonded via a dispatchable. Notably,
   *  it will not be emitted for staking rewards when they are added to stake.
   */
  get isV1051(): boolean {
    return this.ctx._chain.getEventHash('staking.Bonded') === '47facb114cad5e5d0612ab12cd27899aed054423f61b0ee4027c8d49284108a0'
  }

  /**
   *  An account has bonded this amount.
   * 
   *  NOTE: This event is only emitted when funds are bonded via a dispatchable. Notably,
   *  it will not be emitted for staking rewards when they are added to stake.
   */
  get asV1051(): [Uint8Array, bigint] {
    assert(this.isV1051)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV1051
  }

  get asLatest(): [Uint8Array, bigint] {
    deprecateLatest()
    return this.asV1051
  }
}

export class StakingRewardEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'staking.Reward')
  }

  /**
   *  All validators have been rewarded by the first balance; the second is the remainder
   *  from the maximum amount of reward.
   */
  get isV1020(): boolean {
    return this.ctx._chain.getEventHash('staking.Reward') === '32dae74c98912b9cdae2ebe18153eb699fce95395cc82c7a47feaf52780d280f'
  }

  /**
   *  All validators have been rewarded by the first balance; the second is the remainder
   *  from the maximum amount of reward.
   */
  get asV1020(): [bigint, bigint] {
    assert(this.isV1020)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   *  The staker has been rewarded by this amount. AccountId is controller account.
   */
  get isV1050(): boolean {
    return this.ctx._chain.getEventHash('staking.Reward') === '0932e6d4b4a568796adb7119d09859e0df58228c7394b5d0173a5c5ce093a34d'
  }

  /**
   *  The staker has been rewarded by this amount. AccountId is controller account.
   */
  get asV1050(): [Uint8Array, bigint] {
    assert(this.isV1050)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV1050
  }

  get asLatest(): [Uint8Array, bigint] {
    deprecateLatest()
    return this.asV1050
  }
}

export class StakingRewardedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'staking.Rewarded')
  }

  /**
   *  The nominator has been rewarded by this amount. \[stash, amount\]
   */
  get isV9090(): boolean {
    return this.ctx._chain.getEventHash('staking.Rewarded') === '0fb941f3870a0949228cdacebcebdb221028e93af89d7c2935bb73d066386b13'
  }

  /**
   *  The nominator has been rewarded by this amount. \[stash, amount\]
   */
  get asV9090(): [Uint8Array, bigint] {
    assert(this.isV9090)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV9090
  }

  get asLatest(): [Uint8Array, bigint] {
    deprecateLatest()
    return this.asV9090
  }
}

export class StakingSlashEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'staking.Slash')
  }

  /**
   *  One validator (and its nominators) has been slashed by the given amount.
   */
  get isV1020(): boolean {
    return this.ctx._chain.getEventHash('staking.Slash') === '9642dd0541643e506f19da33b70f164668e0832df885607cb887c01fe713159b'
  }

  /**
   *  One validator (and its nominators) has been slashed by the given amount.
   */
  get asV1020(): [Uint8Array, bigint] {
    assert(this.isV1020)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV1020
  }

  get asLatest(): [Uint8Array, bigint] {
    deprecateLatest()
    return this.asV1020
  }
}

export class StakingSlashedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'staking.Slashed')
  }

  /**
   *  One validator (and its nominators) has been slashed by the given amount.
   *  \[validator, amount\]
   */
  get isV9090(): boolean {
    return this.ctx._chain.getEventHash('staking.Slashed') === 'f6a852921cc26702b5320a65eeb483c7cd25e856e09e930a476eeb05dae41665'
  }

  /**
   *  One validator (and its nominators) has been slashed by the given amount.
   *  \[validator, amount\]
   */
  get asV9090(): [Uint8Array, bigint] {
    assert(this.isV9090)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV9090
  }

  get asLatest(): [Uint8Array, bigint] {
    deprecateLatest()
    return this.asV9090
  }
}

export class StakingStakersElectedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'staking.StakersElected')
  }

  /**
   *  A new set of stakers was elected.
   */
  get isV9090(): boolean {
    return this.ctx._chain.getEventHash('staking.StakersElected') === '7d9dbb159d79b8a33ea364b84ed2cf3650a610f073d99da4974487e7723bb116'
  }

  /**
   *  A new set of stakers was elected.
   */
  get asV9090(): null {
    assert(this.isV9090)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV9090
  }

  get asLatest(): null {
    deprecateLatest()
    return this.asV9090
  }
}

export class StakingStakingElectionEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'staking.StakingElection')
  }

  /**
   *  A new set of stakers was elected with the given computation method.
   */
  get isV1058(): boolean {
    return this.ctx._chain.getEventHash('staking.StakingElection') === 'f16641828a211214ff90a76dc1db2eea3e2feb297ba0b8e8c3c23217f1718f77'
  }

  /**
   *  A new set of stakers was elected with the given computation method.
   */
  get asV1058(): v1058.ElectionCompute {
    assert(this.isV1058)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   *  A new set of stakers was elected.
   */
  get isV2030(): boolean {
    return this.ctx._chain.getEventHash('staking.StakingElection') === '47eb9cc5d0a45b5fa6c488f854d4f31a0cc5513315ad8e3cfd72b611c73d2983'
  }

  /**
   *  A new set of stakers was elected.
   */
  get asV2030(): null {
    assert(this.isV2030)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2030
  }

  get asLatest(): null {
    deprecateLatest()
    return this.asV2030
  }
}

export class StakingUnbondedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'staking.Unbonded')
  }

  /**
   *  An account has unbonded this amount.
   */
  get isV1051(): boolean {
    return this.ctx._chain.getEventHash('staking.Unbonded') === '285f3d8850d41cfb19105193c25afbd8f44056ce2ac4b135a1fa1607c5eb5f96'
  }

  /**
   *  An account has unbonded this amount.
   */
  get asV1051(): [Uint8Array, bigint] {
    assert(this.isV1051)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV1051
  }

  get asLatest(): [Uint8Array, bigint] {
    deprecateLatest()
    return this.asV1051
  }
}

export class TreasuryDepositEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'treasury.Deposit')
  }

  /**
   *  Some funds have been deposited.
   */
  get isV1020(): boolean {
    return this.ctx._chain.getEventHash('treasury.Deposit') === '00a6b2996298e567aad20092952a8a74feec74cde3e7a57572700c49512f941d'
  }

  /**
   *  Some funds have been deposited.
   */
  get asV1020(): bigint {
    assert(this.isV1020)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV1020
  }

  get asLatest(): bigint {
    deprecateLatest()
    return this.asV1020
  }
}
