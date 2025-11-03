import { ethers } from "hardhat";

type CommitData = {
  repo: string;
  commit: string;
  linesAdded: bigint;
  linesDeleted: bigint;
  testsPass: boolean;
  timestamp: number;
  author: string;
  message: string;
  merged: boolean;
};

type SingleResult = { mode: string; gasUsed: number; latencyMs: number };
type BatchResult = SingleResult & { count: number; gasPerNFT: number };

function nowMs(): number {
  return Date.now();
}

function toNumber(bi: bigint | undefined): number {
  if (!bi) return 0;
  const n = Number(bi);
  return Number.isFinite(n) ? n : 0;
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const second = signers[1];
  const deployerAddress = await deployer.getAddress();
  const fallbackUserAddress = second ? await second.getAddress() : deployerAddress;
  const recipientAddress = process.env.RECIPIENT_ADDRESS || fallbackUserAddress;

  const lcnFactory = await ethers.getContractFactory("CommitNFT", deployer);
  const commitNFT = await lcnFactory.deploy(
    "LightCommit NFT",
    "LCNFT",
    "https://api.lightcommit.com/metadata/"
  );
  await commitNFT.waitForDeployment();

  const aFactory = await ethers.getContractFactory("ERC721ABench", deployer);
  const erc721a = await aFactory.deploy("ERC721A Bench", "A721");
  await erc721a.waitForDeployment();

  const baseCommit = {
    repo: "lightcommit/repo",
    linesAdded: 100n,
    linesDeleted: 5n,
    testsPass: true,
    author: "benchmark",
    message: "benchmark run",
    merged: true,
  } as const;

  let uniqueCounter = 0;
  function makeCommitData(): CommitData {
    uniqueCounter += 1;
    return {
      repo: baseCommit.repo,
      commit: `bench-commit-${Date.now()}-${uniqueCounter}`,
      linesAdded: baseCommit.linesAdded,
      linesDeleted: baseCommit.linesDeleted,
      testsPass: baseCommit.testsPass,
      timestamp: Math.floor(Date.now() / 1000),
      author: baseCommit.author,
      message: baseCommit.message,
      merged: baseCommit.merged,
    };
  }

  async function runSingleMint(target: any, label: string): Promise<SingleResult & { contract: string }> {
    const commitData = makeCommitData();
    const metadataURI = `https://api.lightcommit.com/metadata/${uniqueCounter}`;
    const start = nowMs();
    const tx = await target.mintCommit(recipientAddress, commitData, metadataURI);
    const receipt = await tx.wait();
    const end = nowMs();
    const gasUsed = toNumber(receipt?.gasUsed);
    return { mode: "single", gasUsed, latencyMs: end - start, contract: label };
  }

  async function runBatchMint(target: any, label: string, size: number): Promise<BatchResult & { contract: string }> {
    const commitsData: CommitData[] = [];
    const metadataURIs: string[] = [];
    for (let i = 0; i < size; i++) {
      commitsData.push(makeCommitData());
      metadataURIs.push(`https://api.lightcommit.com/metadata/${uniqueCounter}-${i}`);
    }
    const start = nowMs();
    const tx = await target.batchMintCommits(recipientAddress, commitsData, metadataURIs);
    const receipt = await tx.wait();
    const end = nowMs();
    const gasUsed = toNumber(receipt?.gasUsed);
    const gasPerNFT = gasUsed / size;
    return { mode: `batch_${size}`, gasUsed, latencyMs: end - start, count: size, gasPerNFT, contract: label };
  }

  const singleRunsEnv = Number(process.env.SINGLE_RUNS || "5");
  const singleRuns = Number.isFinite(singleRunsEnv) && singleRunsEnv > 0 ? singleRunsEnv : 5;
  const results: Array<SingleResult | BatchResult> = [];

  for (let i = 0; i < singleRuns; i++) {
    results.push(await runSingleMint(commitNFT, "CommitNFT"));
    results.push(await runSingleMint(erc721a, "ERC721A"));
  }

  // Contract enforces batch size <= 50
  const batchSizesEnv = (process.env.BATCH_SIZES || "10,50").split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0 && n <= 50) as number[];
  const batchSizes = batchSizesEnv.length ? batchSizesEnv : [10, 50];
  for (const size of batchSizes) {
    results.push(await runBatchMint(commitNFT, "CommitNFT", size));
    results.push(await runBatchMint(erc721a, "ERC721A", size));
  }

  const singles = results.filter((r) => r.mode === "single") as (SingleResult & { contract: string })[];
  const batches = results.filter((r) => r.mode !== "single") as (BatchResult & { contract: string })[];

  const avgSingleGas = average(singles.map((r) => r.gasUsed));
  const avgSingleLatency = average(singles.map((r) => r.latencyMs));

  function fmt(n: number): string {
    return n.toFixed(2);
  }

  // Console output: markdown table for easy copy
  console.log("\nBenchmark Results (local hardhat or configured network)\n");
  console.log("| Contract | Mode | Count | Gas Used (avg) | Gas/NFT | Latency (ms, avg) |");
  console.log("|---|---|---:|---:|---:|---:|");
  const byContractSingle = (label: string) => singles.filter((r) => r.contract === label);
  function avg(vals: number[]): string { return fmt(average(vals)); }
  for (const label of ["CommitNFT", "ERC721A"]) {
    const s = byContractSingle(label);
    if (s.length) {
      console.log(`| ${label} | single | 1 | ${avg(s.map(r=>r.gasUsed))} | ${avg(s.map(r=>r.gasUsed))} | ${avg(s.map(r=>r.latencyMs))} |`);
    }
    for (const size of batchSizes) {
      const bs = batches.filter((r) => r.contract === label && r.count === size);
      if (bs.length) {
        console.log(`| ${label} | batch_${size} | ${size} | ${avg(bs.map(r=>r.gasUsed))} | ${avg(bs.map(r=>r.gasPerNFT))} | ${avg(bs.map(r=>r.latencyMs))} |`);
      }
    }
  }

  // Also dump raw results
  console.log("\nRaw Results:");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


