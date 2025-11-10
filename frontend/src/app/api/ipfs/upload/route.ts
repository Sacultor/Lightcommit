import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 },
      );
    }

    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_KEY;

    if (pinataApiKey && pinataSecretKey) {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretKey,
        },
        body: JSON.stringify({
          pinataContent: JSON.parse(content),
          pinataMetadata: {
            name: `lightcommit-${Date.now()}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Pinata upload failed');
      }

      const data = await response.json();
      return NextResponse.json({ ipfsHash: data.IpfsHash });
    }

    const web3StorageToken = process.env.WEB3_STORAGE_TOKEN;
    if (web3StorageToken) {
      const blob = new Blob([content], { type: 'application/json' });
      const file = new File([blob], 'metadata.json');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api.web3.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${web3StorageToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Web3.Storage upload failed');
      }

      const data = await response.json();
      return NextResponse.json({ ipfsHash: data.cid });
    }

    const hash = Buffer.from(content).toString('base64').substring(0, 46);
    return NextResponse.json({
      ipfsHash: `Qm${hash}`,
      warning: 'Using mock IPFS hash. Configure PINATA_API_KEY or WEB3_STORAGE_TOKEN for real uploads.',
    });

  } catch (error) {
    console.error('IPFS upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload to IPFS' },
      { status: 500 },
    );
  }
}

