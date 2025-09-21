'use client';

interface TransactionHistoryProps {
  account: string;
}

interface Transaction {
  id: string;
  date: string;
  action: string;
  token: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
}

export function TransactionHistory({ account }: TransactionHistoryProps) {
  // Mock data - will be fetched from contract events
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2024-01-15 14:30:25',
      action: 'Deposit',
      token: 'wNEAR',
      amount: 1000,
      status: 'completed',
      txHash: '0x1234...5678'
    },
    {
      id: '2',
      date: '2024-01-15 15:45:12',
      action: 'Allocate',
      token: 'wNEAR',
      amount: 800,
      status: 'completed',
      txHash: '0x2345...6789'
    },
    {
      id: '3',
      date: '2024-01-16 09:15:33',
      action: 'Yield Claimed',
      token: 'wNEAR',
      amount: 12.5,
      status: 'completed',
      txHash: '0x3456...7890'
    },
    {
      id: '4',
      date: '2024-01-16 11:22:45',
      action: 'Deposit',
      token: 'USDC',
      amount: 500,
      status: 'pending'
    },
    {
      id: '5',
      date: '2024-01-14 16:55:18',
      action: 'Withdraw',
      token: 'wNEAR',
      amount: 200,
      status: 'failed',
      txHash: '0x4567...8901'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'failed':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Deposit':
        return '💰';
      case 'Withdraw':
        return '📤';
      case 'Allocate':
        return '🎯';
      case 'Yield Claimed':
        return '📈';
      default:
        return '💫';
    }
  };

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Transaction History
        </h2>
        <p className="text-lg text-slate-800 dark:text-slate-300">
          Complete on-chain transaction log for your account
        </p>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  Action
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  Token
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  Amount
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  Status
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  TX Hash
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-800 dark:text-slate-400">
                    {tx.date}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getActionIcon(tx.action)}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {tx.action}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    {tx.token}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-slate-100">
                    {tx.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {tx.txHash ? (
                      <a 
                        href={`https://nearblocks.io/txns/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-mono"
                      >
                        {tx.txHash}
                      </a>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        <div className="text-center mt-6">
          <button className="px-6 py-2 text-slate-800 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Load More Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
