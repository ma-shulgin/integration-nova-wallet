
export type ElectionCompute = ElectionCompute_OnChain | ElectionCompute_Signed | ElectionCompute_Unsigned

export interface ElectionCompute_OnChain {
  __kind: 'OnChain'
}

export interface ElectionCompute_Signed {
  __kind: 'Signed'
}

export interface ElectionCompute_Unsigned {
  __kind: 'Unsigned'
}
