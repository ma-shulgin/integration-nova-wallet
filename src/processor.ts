import { SubstrateProcessor } from '@subsquid/substrate-processor';
import { handleNewEra, handleStakersElected} from './mappings/NewEra';
import { handleTransfer, } from './mappings/Transfers';
import { handleBonded,handleUnbonded} from './mappings/StakeChanged';
import { handleReward, handleRewarded, handleSlash, handleSlashed } from './mappings/Rewards';
import { handleHistoryElement} from './mappings/HistoryElements';

const processor = new SubstrateProcessor('kusama_balances');

processor.setTypesBundle('kusama');
processor.setBatchSize(500);

processor.setDataSource({
    archive: 'https://kusama.indexer.gc.subsquid.io/v4/graphql',
    chain: 'wss://kusama-rpc.polkadot.io'
});

// range: '[8948000, ]' for era
// range: '[9899296, ]' for slash
// range: '[27572,]'
// range: '[2944530,]' lots of events
//range: '[9950369,]' rewards
//range: '[8124580,]' rewards
//range: '[10402155,10402156]'

processor.setBlockRange({from:2944530}) // lots of events
processor.addPostHook(handleHistoryElement);

processor.addEventHandler('balances.Transfer', handleTransfer);
processor.addEventHandler('staking.Reward', handleReward);
processor.addEventHandler('staking.Rewarded', handleRewarded);
processor.addEventHandler('staking.Slash', handleSlash);
processor.addEventHandler('staking.Slashed)', handleSlashed);
processor.addEventHandler('staking.StakingElection', handleNewEra);
processor.addEventHandler('staking.StakersElected', handleStakersElected);
processor.addEventHandler('staking.Bonded', handleBonded);
processor.addEventHandler('staking.Unbonded', handleUnbonded);
processor.run();