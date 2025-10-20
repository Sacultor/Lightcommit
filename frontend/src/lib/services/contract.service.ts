import { ethers } from 'ethers';

export interface CommitData {
  repo: string;
  commit: string;
  linesAdded: number;
  linesDeleted: number;
  testsPass: boolean;
  timestamp: number;
  author: string;
  message: string;
  merged: boolean;
}

export class ContractService {
  private contract: ethers.Contract;

  constructor(contract: ethers.Contract) {
    this.contract = contract;
  }

  /**
   * 铸造单个 Commit NFT
   */
  async mintCommit(
    to: string,
    commitData: CommitData,
    metadataURI: string,
  ): Promise<{
    success: boolean;
    tokenId?: string;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      console.log('Minting commit...', { to, commitData, metadataURI });

      // 调用合约的 mintCommit 函数
      const tx = await this.contract.mintCommit(to, commitData, metadataURI);
      console.log('Transaction sent:', tx.hash);

      // 等待交易确认
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // 从事件中获取 tokenId
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'CommitMinted';
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        tokenId = parsed?.args?.tokenId?.toString();
      }

      return {
        success: true,
        tokenId,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Mint failed:', error);
      return {
        success: false,
        error: error.message || '铸造失败',
      };
    }
  }

  /**
   * 批量铸造 Commit NFTs
   */
  async batchMintCommits(
    to: string,
    commitsData: CommitData[],
    metadataURIs: string[],
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      console.log('Batch minting commits...', { to, count: commitsData.length });

      const tx = await this.contract.batchMintCommits(to, commitsData, metadataURIs);
      console.log('Batch transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Batch transaction confirmed:', receipt);

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Batch mint failed:', error);
      return {
        success: false,
        error: error.message || '批量铸造失败',
      };
    }
  }

  /**
   * 获取 Commit 数据
   */
  async getCommitData(tokenId: number): Promise<CommitData | null> {
    try {
      const data = await this.contract.getCommitData(tokenId);
      return {
        repo: data.repo,
        commit: data.commit,
        linesAdded: Number(data.linesAdded),
        linesDeleted: Number(data.linesDeleted),
        testsPass: data.testsPass,
        timestamp: Number(data.timestamp),
        author: data.author,
        message: data.message,
        merged: data.merged,
      };
    } catch (error) {
      console.error('Failed to get commit data:', error);
      return null;
    }
  }

  /**
   * 检查 commit 是否已铸造
   */
  async isCommitMinted(commitHash: string): Promise<boolean> {
    try {
      return await this.contract.isCommitMinted(commitHash);
    } catch (error) {
      console.error('Failed to check if commit is minted:', error);
      return false;
    }
  }

  /**
   * 获取用户拥有的 token 数量
   */
  async getUserTokenCount(userAddress: string): Promise<number> {
    try {
      const count = await this.contract.getUserTokenCount(userAddress);
      return Number(count);
    } catch (error) {
      console.error('Failed to get user token count:', error);
      return 0;
    }
  }

  /**
   * 获取总供应量
   */
  async getTotalSupply(): Promise<number> {
    try {
      const supply = await this.contract.totalSupply();
      return Number(supply);
    } catch (error) {
      console.error('Failed to get total supply:', error);
      return 0;
    }
  }

  /**
   * 获取 token URI
   */
  async tokenURI(tokenId: number): Promise<string | null> {
    try {
      return await this.contract.tokenURI(tokenId);
    } catch (error) {
      console.error('Failed to get token URI:', error);
      return null;
    }
  }

  /**
   * 获取 token 的所有者
   */
  async ownerOf(tokenId: number): Promise<string | null> {
    try {
      return await this.contract.ownerOf(tokenId);
    } catch (error) {
      console.error('Failed to get owner:', error);
      return null;
    }
  }

  /**
   * 监听 CommitMinted 事件
   */
  onCommitMinted(
    callback: (
      tokenId: number,
      to: string,
      repo: string,
      commit: string,
      linesAdded: number,
      testsPass: boolean,
      merged: boolean
    ) => void,
  ) {
    this.contract.on(
      'CommitMinted',
      (tokenId, to, repo, commit, linesAdded, testsPass, merged) => {
        callback(
          Number(tokenId),
          to,
          repo,
          commit,
          Number(linesAdded),
          testsPass,
          merged,
        );
      },
    );
  }

  /**
   * 移除事件监听
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

