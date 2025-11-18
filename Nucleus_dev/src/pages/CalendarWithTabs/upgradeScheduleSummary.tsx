// import React, { useState } from 'react';
// import './upgradeScheduleSummary.css';

// interface RowData {
//   customerName: string;
//   dateTime: string;
//   assignedTo: string;
//   status: string;
// }

// const UpgradeScheduleSummary: React.FC = () => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 10;

//   const data: RowData[] = Array.from({ length: 23 }, (_, i) => ({
//     customerName: `Customer ${i + 1}`,
//     dateTime: `2025-10-01 ${10 + (i % 12)}:00`,
//     assignedTo: `Engineer ${String.fromCharCode(65 + (i % 5))}`,
//     status: i % 3 === 0 ? 'Open' : i % 3 === 1 ? 'In Progress' : 'Closed',
//   }));

//   const indexOfLastRow = currentPage * rowsPerPage;
//   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
//   const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
//   const totalPages = Math.ceil(data.length / rowsPerPage);

//   return (
//     <div className="table-container">
//       <table className="upgrade-table">
//         <thead>
//           <tr>
//             <th>Customer Name</th>
//             <th>Date and Time</th>
//             <th>Assigned To</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentRows.map((row, index) => (
//             <tr key={index}>
//               <td>{row.customerName}</td>
//               <td>{row.dateTime}</td>
//               <td>{row.assignedTo}</td>
//               <td>{row.status}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div className="pagination">
//         {Array.from({ length: totalPages }, (_, i) => (
//           <button
//             key={i}
//             onClick={() => setCurrentPage(i + 1)}
//             className={currentPage === i + 1 ? 'active' : ''}
//           >
//             {i + 1}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default UpgradeScheduleSummary;


import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  bgColor: string;
  textColor: string;
}

interface TableRowData {
  customer: string;
  gpsCustomer: string;
  devices: number | null;
  completed: number;
  inProgress: number | null;
  yetToMigrate: number;
}

const summaryData: SummaryCardProps[] = [
  { 
    title: 'Total Devices to be Upgraded-(P2)', 
    value: '15,400', 
    bgColor: 'bg-blue-50', 
    textColor: 'text-blue-600' 
  },
  { 
    title: 'Devices Upgraded-(P3)', 
    value: '3,200', 
    bgColor: 'bg-green-50', 
    textColor: 'text-green-600' 
  },
  { 
    title: 'Remaining Devices to be Upgraded-(P2)', 
    value: '12,200', 
    bgColor: 'bg-orange-50', 
    textColor: 'text-orange-600' 
  },
  { 
    title: '% Of Upgrade Devices', 
    value: '20.77%', 
    bgColor: 'bg-purple-50', 
    textColor: 'text-purple-600' 
  },
];

const tableData: TableRowData[] = [
  { customer: 'ADIDAS AG', gpsCustomer: 'ADIDAS AG', devices: 1400, completed: 547, inProgress: 428, yetToMigrate: 853 },
  { customer: 'Alro Steel Corp', gpsCustomer: 'Alro Steel Corp', devices: 82, completed: 76, inProgress: 3, yetToMigrate: 6 },
  { customer: 'Antech Diagnostics', gpsCustomer: 'Antech Diagnostics', devices: 1, completed: 547, inProgress: null, yetToMigrate: 1 },
  { customer: 'Anvil International (Acs Eng...', gpsCustomer: 'ASC Engineered Solution..', devices: 19, completed: 547, inProgress: null, yetToMigrate: 19 },
  { customer: 'Associated British Foods PLC', gpsCustomer: 'Associated British Food..', devices: 2, completed: 18, inProgress: null, yetToMigrate: 2 },
  { customer: 'AT&T MOW Network Service..', gpsCustomer: 'AT&T Mow Network Se...', devices: null, completed: 547, inProgress: 10, yetToMigrate: -18 },
  { customer: 'AT&T VPN Product Managem...', gpsCustomer: 'AT&T VPN Product Manag..', devices: 10, completed: 2, inProgress: null, yetToMigrate: 10 },
  { customer: 'Bass Pro Shops', gpsCustomer: 'Bass Pro Shops', devices: 210, completed: 547, inProgress: null, yetToMigrate: 210 },
  { customer: 'Boca Raton City Hall', gpsCustomer: 'Boca Raton City Hall', devices: 2, completed: 547, inProgress: null, yetToMigrate: 2 },
  { customer: 'Bridgestone Corp', gpsCustomer: 'Bridgestone Corp', devices: 33, completed: 547, inProgress: null, yetToMigrate: 33 },
  { customer: 'Antech Diagnostics', gpsCustomer: 'Antech Diagnostics', devices: 1, completed: 547, inProgress: null, yetToMigrate: 34 },
  { customer: 'AT&T VPN Product Managem...', gpsCustomer: 'AT&T VPN Product Manag..', devices: 10, completed: 2, inProgress: null, yetToMigrate: 22 },
  { customer: 'Boca Raton City Hall', gpsCustomer: 'Boca Raton City Hall', devices: 2, completed: 547, inProgress: null, yetToMigrate: 5 },
  { customer: 'Associated British Foods PLC', gpsCustomer: 'Associated British Food..', devices: 2, completed: 18, inProgress: null, yetToMigrate: 8 },
  { customer: 'Antech Diagnostics', gpsCustomer: 'Antech Diagnostics', devices: 1, completed: 547, inProgress: null, yetToMigrate: 9 },
  { customer: 'Bass Pro Shops', gpsCustomer: 'Bass Pro Shops', devices: 210, completed: 547, inProgress: null, yetToMigrate: 5 },
  { customer: 'ADIDAS AG', gpsCustomer: 'ADIDAS AG', devices: 1400, completed: 547, inProgress: null, yetToMigrate: 56 },
];

type SortColumn = 'customer' | 'gpsCustomer' | 'devices' | 'completed' | 'inProgress' | 'yetToMigrate' | '';
type SortDirection = 'asc' | 'desc';

const UpgradeScheduleSummary: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const totalPages = 25;

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon: React.FC<{ column: SortColumn }> = ({ column }) => {
    if (sortColumn !== column) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-gray-700" /> : 
      <ChevronDown className="w-4 h-4 text-gray-700" />;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryData.map((item, index) => (
          <div 
            key={index} 
            className={`${item.bgColor} border border-gray-200 rounded-lg p-4 shadow-sm`}
          >
            <p className="text-xs text-gray-600 mb-2">
              {item.title}
            </p>
            <p className={`text-3xl font-semibold ${item.textColor}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center gap-1">
                    Customer Name
                    <SortIcon column="customer" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('gpsCustomer')}
                >
                  <div className="flex items-center gap-1">
                    GPS Customer Name
                    <SortIcon column="gpsCustomer" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('devices')}
                >
                  <div className="flex items-center gap-1">
                    Devices
                    <SortIcon column="devices" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('completed')}
                >
                  <div className="flex items-center gap-1">
                    Completed
                    <SortIcon column="completed" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('inProgress')}
                >
                  <div className="flex items-center gap-1">
                    In Progress
                    <SortIcon column="inProgress" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('yetToMigrate')}
                >
                  <div className="flex items-center gap-1">
                    Yet To Migrate
                    <SortIcon column="yetToMigrate" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr 
                  key={index}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">{row.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.gpsCustomer}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.devices ?? ''}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.completed}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.inProgress ?? ''}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.yetToMigrate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="First page"
          >
            <ChevronsLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {getPageNumbers().map((pageNum, index) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-600">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum as number)}
                className={`px-3 py-1 rounded border ${
                  page === pageNum
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            )
          ))}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Last page"
          >
            <ChevronsRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeScheduleSummary;