'use client';

import { NearBlocksViewer } from '@/components/NearBlocksViewer';

export default function NearBlocksTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">NearBlocks Transaction Viewer Test</h1>
      <p className="mb-6">Viewing transactions for wallet: bctemp.near</p>
      <NearBlocksViewer />
    </div>
  );
}