// 区块链相关类型定义

// 交易对象类型
export interface TransactionRequest {
  to?: string;
  from?: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
  type?: number;
  chainId?: number;
}

// 交易响应类型
export interface TransactionResponse {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasLimit: string;
  gasPrice: string;
  data: string;
  nonce: number;
  blockNumber?: number;
  blockHash?: string;
  transactionIndex?: number;
  confirmations: number;
  wait: (confirmations?: number) => Promise<TransactionReceipt>;
}

// 交易收据类型
export interface TransactionReceipt {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string | null;
  gasUsed: string;
  cumulativeGasUsed: string;
  status?: number;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    logIndex: number;
  }>;
}

// 合约接口类型
export interface ContractInterface {
  format: (format?: string) => string[];
  getFunction: (nameOrSignature: string) => unknown;
  getEvent: (nameOrSignature: string) => unknown;
  encodeFunctionData: (fragment: string, values?: unknown[]) => string;
  decodeFunctionResult: (fragment: string, data: string) => unknown[];
}

// Ethers.js 相关类型
export interface EthersProvider {
  getNetwork(): Promise<{ chainId: number; name: string }>;
  getBlockNumber(): Promise<number>;
  getGasPrice(): Promise<bigint>;
  getBalance(address: string): Promise<bigint>;
  getTransaction(hash: string): Promise<TransactionResponse | null>;
  getTransactionReceipt(hash: string): Promise<TransactionReceipt | null>;
  estimateGas(transaction: TransactionRequest): Promise<bigint>;
  send(method: string, params: unknown[]): Promise<unknown>;
  getFeeData(): Promise<{ gasPrice: bigint; maxFeePerGas?: bigint; maxPriorityFeePerGas?: bigint }>;
}

export interface EthersWallet {
  address: string;
  privateKey: string;
  provider: EthersProvider;
  getBalance(): Promise<bigint>;
  signTransaction(transaction: TransactionRequest): Promise<string>;
  sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
}

export interface EthersContract {
  address: string;
  interface: ContractInterface;
  provider: EthersProvider;
  signer?: EthersWallet;
  [key: string]: unknown;
}

// 网络信息类型
export interface NetworkInfo {
  chainId: string;
  name: string;
  blockNumber: number;
  gasPrice: string;
}

// 交易状态类型
export interface TransactionStatus {
  transaction: {
    hash: string;
    from: string;
    to: string;
    value: string;
    gasLimit: string;
    gasPrice: string;
    nonce: number;
    data: string;
    blockNumber?: number;
    blockHash?: string;
    transactionIndex?: number;
  };
  receipt: {
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string;
    gasUsed: string;
    cumulativeGasUsed: string;
    status: number;
    logs: Array<{
      address: string;
      topics: string[];
      data: string;
      blockNumber: number;
      transactionHash: string;
      transactionIndex: number;
      blockHash: string;
      logIndex: number;
    }>;
  } | null;
  status: 'success' | 'failed' | 'pending';
  confirmations?: number;
}


// 合约信息类型
export interface ContractInfo {
  address: string;
  name?: string;
  symbol?: string;
  totalSupply?: string;
  owner?: string;
  version?: string;
}

// Gas 估算结果类型
export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  totalCost: bigint;
}

// 钱包余额类型
export interface WalletBalance {
  address: string;
  balance: string;
  formattedBalance: string;
  currency: string;
}

// NFT 元数据类型
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  background_color?: string;
  animation_url?: string;
}

// 铸造结果类型
export interface MintResult {
  transactionHash: string;
  tokenId: string;
  to: string;
  gasUsed: string;
  blockNumber: number;
}

// 批量铸造结果类型
export interface BatchMintResult {
  successful: string[];
  failed: Array<{
    contributionId: string;
    error: string;
  }>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

// 区块链配置类型
export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  contractAddress: string;
  privateKey?: string;
  gasLimit: number;
  gasPrice: string;
  confirmations: number;
}

// 事件日志类型
export interface EventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
  event?: string;
  args?: Record<string, unknown>;
}

// 区块链信息类型
export interface BlockInfo {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  gasLimit: string;
  gasUsed: string;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  transactions: string[];
}
