import assert from 'assert'
import {CallContext, Result, deprecateLatest} from './support'

export class StakingPayoutNominatorCall {
  constructor(private ctx: CallContext) {
    assert(this.ctx.extrinsic.name === 'staking.payoutNominator' || this.ctx.extrinsic.name === 'staking.payout_nominator')
  }

  /**
   *  Make one nominator's payout for one era.
   * 
   *  - `who` is the controller account of the nominator to pay out.
   *  - `era` may not be lower than one following the most recently paid era. If it is higher,
   *    then it indicates an instruction to skip the payout of all previous eras.
   *  - `validators` is the list of all validators that `who` had exposure to during `era`.
   *    If it is incomplete, then less than the full reward will be paid out.
   *    It must not exceed `MAX_NOMINATIONS`.
   * 
   *  WARNING: once an era is payed for a validator such validator can't claim the payout of
   *  previous era.
   * 
   *  WARNING: Incorrect arguments here can result in loss of payout. Be very careful.
   * 
   *  # <weight>
   *  - Number of storage read of `O(validators)`; `validators` is the argument of the call,
   *    and is bounded by `MAX_NOMINATIONS`.
   *  - Each storage read is `O(N)` size and decode complexity; `N` is the  maximum
   *    nominations that can be given to a single validator.
   *  - Computation complexity: `O(MAX_NOMINATIONS * logN)`; `MAX_NOMINATIONS` is the
   *    maximum number of validators that may be nominated by a single nominator, it is
   *    bounded only economically (all nominators are required to place a minimum stake).
   *  # </weight>
   */
  get isV1050(): boolean {
    return this.ctx._chain.getCallHash('staking.payout_nominator') === '309ed308d75d3fcdb9c303cc4b4ffb4dc81f81eaa15e92d386daf0760ce71008'
  }

  /**
   *  Make one nominator's payout for one era.
   * 
   *  - `who` is the controller account of the nominator to pay out.
   *  - `era` may not be lower than one following the most recently paid era. If it is higher,
   *    then it indicates an instruction to skip the payout of all previous eras.
   *  - `validators` is the list of all validators that `who` had exposure to during `era`.
   *    If it is incomplete, then less than the full reward will be paid out.
   *    It must not exceed `MAX_NOMINATIONS`.
   * 
   *  WARNING: once an era is payed for a validator such validator can't claim the payout of
   *  previous era.
   * 
   *  WARNING: Incorrect arguments here can result in loss of payout. Be very careful.
   * 
   *  # <weight>
   *  - Number of storage read of `O(validators)`; `validators` is the argument of the call,
   *    and is bounded by `MAX_NOMINATIONS`.
   *  - Each storage read is `O(N)` size and decode complexity; `N` is the  maximum
   *    nominations that can be given to a single validator.
   *  - Computation complexity: `O(MAX_NOMINATIONS * logN)`; `MAX_NOMINATIONS` is the
   *    maximum number of validators that may be nominated by a single nominator, it is
   *    bounded only economically (all nominators are required to place a minimum stake).
   *  # </weight>
   */
  get asV1050(): {era: number, validators: [Uint8Array, number][]} {
    assert(this.isV1050)
    return this.ctx._chain.decodeCall(this.ctx.extrinsic)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV1050
  }

  get asLatest(): {era: number, validators: [Uint8Array, number][]} {
    deprecateLatest()
    return this.asV1050
  }
}

export class StakingPayoutStakersCall {
  constructor(private ctx: CallContext) {
    assert(this.ctx.extrinsic.name === 'staking.payoutStakers' || this.ctx.extrinsic.name === 'staking.payout_stakers')
  }

  /**
   *  Pay out all the stakers behind a single validator for a single era.
   * 
   *  - `validator_stash` is the stash account of the validator. Their nominators, up to
   *    `T::MaxNominatorRewardedPerValidator`, will also receive their rewards.
   *  - `era` may be any era between `[current_era - history_depth; current_era]`.
   * 
   *  The origin of this call must be _Signed_. Any account can call this function, even if
   *  it is not one of the stakers.
   * 
   *  This can only be called when [`EraElectionStatus`] is `Closed`.
   * 
   *  # <weight>
   *  - Time complexity: at most O(MaxNominatorRewardedPerValidator).
   *  - Contains a limited number of reads and writes.
   *  # </weight>
   */
  get isV1058(): boolean {
    return this.ctx._chain.getCallHash('staking.payout_stakers') === 'cd2c58520ae59e526db72fb44f40c75d56f9b6a6cfa21b22507d9b3b63bb8040'
  }

  /**
   *  Pay out all the stakers behind a single validator for a single era.
   * 
   *  - `validator_stash` is the stash account of the validator. Their nominators, up to
   *    `T::MaxNominatorRewardedPerValidator`, will also receive their rewards.
   *  - `era` may be any era between `[current_era - history_depth; current_era]`.
   * 
   *  The origin of this call must be _Signed_. Any account can call this function, even if
   *  it is not one of the stakers.
   * 
   *  This can only be called when [`EraElectionStatus`] is `Closed`.
   * 
   *  # <weight>
   *  - Time complexity: at most O(MaxNominatorRewardedPerValidator).
   *  - Contains a limited number of reads and writes.
   *  # </weight>
   */
  get asV1058(): {validatorStash: Uint8Array, era: number} {
    assert(this.isV1058)
    return this.ctx._chain.decodeCall(this.ctx.extrinsic)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV1058
  }

  get asLatest(): {validatorStash: Uint8Array, era: number} {
    deprecateLatest()
    return this.asV1058
  }
}

export class StakingPayoutValidatorCall {
  constructor(private ctx: CallContext) {
    assert(this.ctx.extrinsic.name === 'staking.payoutValidator' || this.ctx.extrinsic.name === 'staking.payout_validator')
  }

  /**
   *  Make one validator's payout for one era.
   * 
   *  - `who` is the controller account of the validator to pay out.
   *  - `era` may not be lower than one following the most recently paid era. If it is higher,
   *    then it indicates an instruction to skip the payout of all previous eras.
   * 
   *  WARNING: once an era is payed for a validator such validator can't claim the payout of
   *  previous era.
   * 
   *  WARNING: Incorrect arguments here can result in loss of payout. Be very careful.
   * 
   *  # <weight>
   *  - Time complexity: O(1).
   *  - Contains a limited number of reads and writes.
   *  # </weight>
   */
  get isV1050(): boolean {
    return this.ctx._chain.getCallHash('staking.payout_validator') === '83d63246ef562e5cfe65985f37b70713643a1b879a0f69eb7c6c2993c8e654ad'
  }

  /**
   *  Make one validator's payout for one era.
   * 
   *  - `who` is the controller account of the validator to pay out.
   *  - `era` may not be lower than one following the most recently paid era. If it is higher,
   *    then it indicates an instruction to skip the payout of all previous eras.
   * 
   *  WARNING: once an era is payed for a validator such validator can't claim the payout of
   *  previous era.
   * 
   *  WARNING: Incorrect arguments here can result in loss of payout. Be very careful.
   * 
   *  # <weight>
   *  - Time complexity: O(1).
   *  - Contains a limited number of reads and writes.
   *  # </weight>
   */
  get asV1050(): {era: number} {
    assert(this.isV1050)
    return this.ctx._chain.decodeCall(this.ctx.extrinsic)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV1050
  }

  get asLatest(): {era: number} {
    deprecateLatest()
    return this.asV1050
  }
}

export class TimestampSetCall {
  constructor(private ctx: CallContext) {
    assert(this.ctx.extrinsic.name === 'timestamp.set')
  }

  /**
   *  Set the current time.
   * 
   *  This call should be invoked exactly once per block. It will panic at the finalization
   *  phase, if this call hasn't been invoked by that time.
   * 
   *  The timestamp should be greater than the previous one by the amount specified by
   *  `MinimumPeriod`.
   * 
   *  The dispatch origin for this call must be `Inherent`.
   */
  get isV1020(): boolean {
    return this.ctx._chain.getCallHash('timestamp.set') === '3c832e2f9c65e106d08e422b5962c90f9f8bc4c4172cb0bf1927eb3c2b23f6ce'
  }

  /**
   *  Set the current time.
   * 
   *  This call should be invoked exactly once per block. It will panic at the finalization
   *  phase, if this call hasn't been invoked by that time.
   * 
   *  The timestamp should be greater than the previous one by the amount specified by
   *  `MinimumPeriod`.
   * 
   *  The dispatch origin for this call must be `Inherent`.
   */
  get asV1020(): {now: (number | bigint)} {
    assert(this.isV1020)
    return this.ctx._chain.decodeCall(this.ctx.extrinsic)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV1020
  }

  get asLatest(): {now: (number | bigint)} {
    deprecateLatest()
    return this.asV1020
  }
}
