import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { ContributionRepository } from '@/lib/database/repositories/contribution.repository';
import { ERC8004Service, ERC8004Feedback } from '@/lib/services/erc8004.service';
import { getConfig } from '@/lib/config';

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const { id } = context.params;

    const contribution = await ContributionRepository.findById(id);
    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 },
      );
    }

    if (!contribution.score) {
      return NextResponse.json(
        { error: 'Contribution not scored yet' },
        { status: 400 },
      );
    }

    const config = getConfig();
    const privateKey = process.env.EVALUATOR_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Evaluator private key not configured' },
        { status: 500 },
      );
    }

    const provider = new ethers.JsonRpcProvider(config.rpc.url);
    const signer = new ethers.Wallet(privateKey, provider);
    const evaluatorAddress = await signer.getAddress();

    const userWallet = contribution.user?.walletAddress;
    if (!userWallet) {
      return NextResponse.json(
        { error: 'User wallet address not found' },
        { status: 400 },
      );
    }

    const repo = contribution.repository?.fullName || '';
    const commitSha = (contribution.metadata as Record<string, unknown>)?.sha as string || '';

    if (!repo || !commitSha) {
      return NextResponse.json(
        { error: 'Missing repo or commit SHA' },
        { status: 400 },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const feedbackHash = ERC8004Service.generateFeedbackHash(
      repo,
      commitSha,
      contribution.score,
      timestamp,
    );

    const nonce = 0;

    const feedback: ERC8004Feedback = {
      contributor: userWallet,
      repo,
      commitSha,
      score: contribution.score,
      feedbackHash,
      timestamp,
      nonce,
    };

    const breakdown = (contribution.scoreBreakdown as Record<string, number>) || {
      convention: 0,
      size: 0,
      filesImpact: 0,
      mergeSignal: 0,
      metadataCompleteness: 0,
    };

    const evidence = {
      diffUrl: contribution.url || '',
      testResults: 'pending',
      linterReport: 'pending',
    };

    const metadataJSON = await ERC8004Service.generateMetadataJSON(
      feedback,
      breakdown,
      evidence,
    );

    const metadataURI = await ERC8004Service.uploadToIPFS(metadataJSON);

    const chainId = config.blockchain.chainId;
    const reputationRegistryAddress = config.blockchain.reputationRegistry;

    const { ReputationRegistryABI } = await import('@/lib/contracts');
    const reputationContract = new ethers.Contract(
      reputationRegistryAddress,
      ReputationRegistryABI,
      provider,
    );

    const currentNonce = await reputationContract.nonces(evaluatorAddress);

    const params = {
      contributor: userWallet,
      repo,
      commitSha,
      score: contribution.score,
      feedbackHash,
      metadataURI,
      timestamp,
      nonce: Number(currentNonce),
    };

    const signature = await ERC8004Service.signFeedback(
      { ...feedback, nonce: Number(currentNonce) },
      signer,
      chainId,
      reputationRegistryAddress,
    );

    const recoveredAddress = await ERC8004Service.verifySignature(
      { ...feedback, nonce: Number(currentNonce) },
      signature,
      chainId,
      reputationRegistryAddress,
    );

    if (recoveredAddress.toLowerCase() !== evaluatorAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      params,
      signature,
      metadataJSON,
      breakdown,
      evaluator: evaluatorAddress,
      shouldMint: contribution.score >= 80,
    });
  } catch (error) {
    console.error('Sign feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to sign feedback' },
      { status: 500 },
    );
  }
}


